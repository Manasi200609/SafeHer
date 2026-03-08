import { COLORS } from "../styles/globalStyles";
import awsConfig from "../../aws-exports";

// ── Smart API URL: local Express OR AWS API Gateway ────────
export const API_URL = awsConfig.awsEnabled
  ? awsConfig.apiGatewayUrl
  : awsConfig.localApiUrl;

// ── API fetch with timeout + smart auth header ─────────────
export const apiFetch = async (endpoint, method = "GET", body = null, token = null) => {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10000);
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      // AWS Cognito sends raw ID token; local Express uses Bearer
      headers["Authorization"] = awsConfig.awsEnabled ? token : `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      signal: controller.signal,
      ...(body && { body: JSON.stringify(body) }),
    });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === "AbortError")
      return { success: false, message: "Request timed out. Is your server running?" };
    return { success: false, message: "Cannot reach server. Check aws-exports.js or your local IP." };
  }
};

// Add this below your existing apiFetch function in data.js

/**
 * Securely uploads an audio file to Amazon S3 using a pre-signed URL.
 * @param {string} localUri - The local file path from Expo Audio
 * @param {string} token - The user's auth token
 */
export const uploadStealthAudio = async (localUri, token) => {
try {
console.log("🚀 Step 1: Requesting S3 URL...");
console.log("🔗 Endpoint:", API_URL + "/safety/upload-url");

// Request a secure upload ticket (Pre-signed URL) from your API Gateway
const urlRes = await apiFetch("/safety/upload-url", "GET", null, token);

// THIS IS THE MAGIC LINE: Print exactly what AWS is saying back!
console.log("📥 AWS Raw Response:", urlRes);

if (!urlRes || !urlRes.success || !urlRes.uploadUrl) {
  throw new Error("AWS Rejected Request: " + JSON.stringify(urlRes));
}

const { uploadUrl, fileKey } = urlRes;

console.log("✅ Step 2: URL Received! Converting audio...");
const fileResponse = await fetch(localUri);
const audioBlob = await fileResponse.blob();

console.log("☁️ Step 3: Pushing to S3 Bucket...");
const uploadRes = await fetch(uploadUrl, {
  method: "PUT",
  body: audioBlob,
  headers: {
    "Content-Type": "audio/m4a", 
  },
});

if (!uploadRes.ok) {
  throw new Error("Failed to upload audio file to S3. Status: " + uploadRes.status);
}

console.log("🎉 SUCCESS: Evidence securely uploaded to S3! File Key:", fileKey);
return { success: true, fileKey };
} catch (error) {
console.error("🚨 Audio Upload Error:", error.message);
return { success: false, error: error.message };
}
};
// ── Cognito direct auth (used when awsEnabled = true) ──────
export const cognitoSignIn = async (email, password) => {
  const res = await fetch(
    `https://cognito-idp.${awsConfig.region}.amazonaws.com/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
      },
      body: JSON.stringify({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: awsConfig.cognito.clientId,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.__type || "Auth failed");
  return data.AuthenticationResult; // { IdToken, AccessToken, RefreshToken }
};

// ── Static data ─────────────────────────────────────────────
export const ONBOARDING_STEPS = [
  {
    step: "01 — Intelligence",
    heading: "Predictive Safety,",
    heading2: "Not Reactive",
    body: "SafeHer continuously monitors your environment and predicts risk before it happens — so you're always one step ahead.",
    icon: "shield-checkmark",
  },
  {
    step: "02 — Awareness",
    heading: "Real-Time Safety",
    heading2: "Score",
    body: "A dynamic Live Safety Score (0–100) analyzes time, location, movement and behavior instantly.",
    icon: "radio",
  },
  {
    step: "03 — Network",
    heading: "Your Trusted",
    heading2: "Guardian Circle",
    body: "Trusted contacts are automatically alerted when risk escalates — your invisible safety net.",
    icon: "people",
  },
  {
    step: "04 — Privacy",
    heading: "Your Data",
    heading2: "Stays Yours",
    body: "Privacy-first by design. No unnecessary data storage. Your safety intelligence, your terms.",
    icon: "lock-closed",
  },
];

export const RISK_FACTORS = [
  { name: "Time of Day",      level: 0.8, color: COLORS.high,   icon: "time-outline",     bg: "rgba(255,128,96,0.14)"  },
  { name: "Area Risk Index",  level: 0.5, color: COLORS.medium, icon: "location-outline", bg: "rgba(240,192,96,0.14)"  },
  { name: "Movement Pattern", level: 0.2, color: COLORS.safe,   icon: "walk-outline",     bg: "rgba(78,205,196,0.14)"  },
  { name: "Voice Analysis",   level: 0.1, color: COLORS.safe,   icon: "mic-outline",      bg: "rgba(78,205,196,0.14)"  },
];

export const NEARBY_ALERTS = [
  { title: "Poorly lit zone ahead",   desc: "Street lighting inadequate. 350m away on MG Road.", time: "Now",    color: COLORS.medium },
  { title: "Community safety report", desc: "3 users flagged this area unsafe after 10 PM.",      time: "2h ago", color: COLORS.high   },
  { title: "Safe zone: Coffee Bay",   desc: "Open 24/7 — designated safe haven location.",         time: "Nearby", color: COLORS.safe   },
];
/**
 * Triggers the AWS GenAI Safety Pipeline
 * 1. Requests a context-aware script from Bedrock
 * 2. Generates Neural AI Voice via Polly
 * 3. Returns a signed S3 URL for the MP3 playback
 */
export const generateSmartCall = async (context, token) => {
  try {
    // Exact API Gateway URL from your successful deployment
    const BASE_URL = "https://wsvc4df22g.execute-api.ap-south-1.amazonaws.com";
    const endpoint = BASE_URL + "/safety/cover-call";
    
    console.log(`🧠 Contacting Guardian AI for situation: ${context}...`);
    
    // We use a POST request to send the situation context to the backend
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        // Ensure the token is formatted correctly for your Auth middleware
        "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        situation: context,    // e.g., "IN_CAB", "WALKING", "FOLLOWED"
        locationText: "Pune",  // Hardcoded for demo, could be real GPS later
        timeText: "Late Night" 
      })
    });

    // Check if the server responded at all
    if (!res.ok) {
      const errorText = await res.text();
      console.error("📥 Server Error Response:", errorText);
      throw new Error(`Server responded with status: ${res.status}`);
    }

    const data = await res.json();
    
    /**
     * Even if Bedrock (the LLM) fails, our backend 'Circuit Breaker' 
     * should still return a valid audioUrl from Polly.
     */
    if (data && data.audioUrl) {
      console.log("✅ AI Guardian Audio Received successfully!");
      return {
        success: true,
        audioUrl: data.audioUrl,
        script: data.script || "Incoming Guardian Call..."
      };
    } else {
      throw new Error("No audio URL found in server response");
    }

  } catch (error) {
    console.error("🚨 generateSmartCall Frontend Error:", error.message);
    // Return a structured error so the UI can handle it gracefully
    return {
      success: false,
      error: error.message
    };
  }
};