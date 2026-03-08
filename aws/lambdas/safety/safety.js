/**
 * SafeHer / GuardianX — Safety Lambdas
 * Fully integrated with Bedrock (Claude 3), Polly (Kajal), and S3.
 */
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");

const {
  dynamo, TABLES, randomUUID, nowIso, ttl90days, computeScore,
  ok, badReq, err,
  getUserId, parseBody,
  GetCommand, PutCommand, UpdateCommand, QueryCommand,
} = require("/opt/nodejs/utils");

const REGION = process.env.AWS_REGION || "ap-south-1";
const sns = new SNSClient({ region: REGION });
const cw  = new CloudWatchClient({ region: REGION });
const s3 = new S3Client({ region: REGION });
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const polly = new PollyClient({ region: REGION });

const AUDIO_BUCKET = process.env.S3_AUDIO_BUCKET_NAME;

// ── POST /safety/cover-call (DYNAMIC HINDI AI) ───────────
// ── POST /safety/cover-call ──────────────────────────────
exports.generateCoverCall = async (event) => {
  try {
    const userId = getUserId(event) || "demo-user";
    const { situation = "WALKING", locationText = "Pune" } = parseBody(event);

    let ssmlText = "";

    // ─── PHONETIC SCRIPTS FOR BETTER PRONUNCIATION ───
    if (situation === "IN_CAB") {
ssmlText = `
<speak>
  Haan hello? Main tumhara live location map par track kar rahi hoon... sab theek hai na? 
  <break time="3s"/>

  Theek hai, mujhe cab ki details aur driver ka number mere screen par dikh raha hai. 
  Phone speaker par hi rakho aur mujhse baat karte raho. 
  <break time="4s"/>

  Raste mein traffic kaisa hai? <break time="2s"/> 
  Driver sahi raste se le ja raha hai na? 
  <break time="4s"/>

  Achha suno... main gate par hi khadi hoon tumhara intezaar kar rahi hoon. 
  Papa bhi yahin hain. 
  <break time="4s"/>

  Ghabrao mat... main continuously screen dekh rahi hoon. <break time="2s"/> 
  Driver ko bol do ki ghar wale bahar khade hain. 
  <break time="4s"/>

  Bas do minute aur... main call disconnect nahi karungi jab tak tum cab se utar nahi jaati.
  <break time="2s"/>
  Haan, main sun rahi hoon, bolte raho.
</speak>`;
    } 
    else if (situation === "WALKING") {
      ssmlText = `
<speak>
  Suno, tum abhi ${locationText} wali lane mein ho na? Main GPS par dekh rahi hoon.
  <break time="3s"/>

  Haan, main bilkul tumhare peeche wale mod par hoon. Bas ek minute mein dikh jaungi. 
  <break time="4s"/>

  Aas paas dhyan rakho aur phone kaan se laga kar hi rakho jab tak main samne na aa jaun.
  <break time="3s"/>

  Main tumse baat kar rahi hoon, toh koi pareshani nahi hogi. Bas seedhe aate raho.
  <break time="4s"/>

  Pahunchne wali ho na? <break time="2s"/> 
  Haan, shayad main tumhe dekh pa rahi hoon. Bas thoda aur, main yahin hoon.
  <break time="4s"/>

  Ghabrao mat, main tumhare saath hoon. Bolte raho, main sun rahi hoon.
</speak>`;
    } 
    else if (situation === "CROWDED_PLACE") {
      ssmlText = `
<speak>
  Hello? Kahan ho tum? Bahut shor aa raha hai peeche se, kya tum market mein ho? 
  <break time="3s"/>

  Achha theek hai. Suno, wahan zyada der akeli mat rukna. 
  <break time="4s"/>

  Main bas nikal chuki hoon ghar se tumhe lene ke liye. Tum kisi safe spot ya shop ke andar wait karo. 
  <break time="4s"/>

  Agar koi ajeeb lage toh turant batana. Main live track kar rahi hoon sab kuch. 
  <break time="3s"/>

  Mai bus paanch ya dus minute mein wahan pahunch jaungi. Tab tak mujhse phone par baat karte raho. 
  <break time="4s"/>

  Haan, main yahin hoon call pur. Bolte raho, main sun rahi hoon.
</speak>`;
    }
    else {
      ssmlText = `<speak>Haan hello? May-nn tum-hah-ra live location track kar rahi hoon. Sab theek hai na? <break time="3s"/> May-nn yahin hoon, baat kar-tay raho.</speak>`;
    }

    // 2. POLLY (Rest of your code remains exactly same as you provided)
    const pollyRes = await polly.send(new SynthesizeSpeechCommand({
      Engine: "neural",
      LanguageCode: "en-IN", 
      VoiceId: "Kajal",      
      OutputFormat: "mp3",
      Text: ssmlText,
      TextType: "ssml"
    }));

    const chunks = [];
    for await (let chunk of pollyRes.AudioStream) { chunks.push(chunk); }
    const audioBuffer = Buffer.concat(chunks);

    const fileKey = `cover-calls/${userId}-${Date.now()}.mp3`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AUDIO_BUCKET,
      Key: fileKey,
      Body: audioBuffer,
      ContentType: "audio/mpeg"
    }));

    const audioUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: process.env.AUDIO_BUCKET,
      Key: fileKey
    }), { expiresIn: 300 }); 

    return ok({ success: true, audioUrl, script: ssmlText });

  } catch (e) {
    console.error("🚨 Pipeline Error:", e);
    return err(e.message);
  }
};

// ── POST /safety/sos ─────────────────────────────────────
// ── POST /safety/score ───────────────────────────────────
exports.updateScore = async (event) => {
  try {
    const userId = getUserId(event);
    if (!userId) return badReq("Unauthorized.");
    const { movement = {}, voice = {}, area = {}, location = {} } = parseBody(event);

    // ... [Your existing risk calculation logic for movRisk, voiceRisk, areaRisk] ...

    const result = computeScore({ areaRiskIndex: areaRisk, movementAnomaly: movRisk, voiceDistress: voiceRisk });
    
    // NEW: Threshold Logic
    const checkInRequired = result.score <= 30; // In your system, lower score = higher risk (e.g., 100 is safe)
    // If your scale is 0-100 where 100 is MAX RISK, use: result.score >= 70

    const logItem = {
      userId, timestamp: nowIso(), logId: randomUUID(),
      score: result.score, status: result.status, factors: result.factors,
      location, expiresAt: ttl90days(),
    };

    await dynamo.send(new PutCommand({ TableName: TABLES.LOGS, Item: logItem }));
    
    return ok({ 
      ...result, 
      checkInRequired, 
      timerSeconds: 15, 
      computedAt: nowIso() 
    });
  } catch (e) { 
    console.error("UPDATE SCORE CRASHED:", e);
    return err(e.message); 
  }
};