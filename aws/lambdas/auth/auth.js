/**
 * SafeHer — Auth Lambdas
 * register.handler  →  POST /auth/register
 * login.handler     →  POST /auth/login
 * getProfile        →  GET  /auth/profile
 * updateSettings    →  PUT  /auth/settings
 */

const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
  InitiateAuthCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const {
  dynamo, TABLES, randomUUID, nowIso,
  ok, created, badReq, unauth, notFound, err,
  getUserId, parseBody,
  GetCommand, PutCommand, UpdateCommand,
} = require("/opt/nodejs/utils");

// Initialize Cognito using the region provided by the Lambda environment
const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID   = process.env.COGNITO_CLIENT_ID;
const POOL_ID     = process.env.COGNITO_USER_POOL_ID;

// ── Phone number formatting helper ────────────────────────
const formatPhoneNumber = (phoneStr) => {
  if (!phoneStr) return null;
  // Remove all non-digit characters except leading +
  let cleaned = phoneStr.replace(/^\+/, "").replace(/\D/g, "");
  if (!cleaned) return null;
  // If no country code (fewer than 10 digits or standard US format), assume +91 (India)
  if (cleaned.length === 10) cleaned = "91" + cleaned;
  // Ensure it starts with country code, default to +91 if missing
  if (cleaned.length < 11) cleaned = "91" + cleaned;
  // Return E.164 format
  return "+" + cleaned;
};

// ── POST /auth/register ──────────────────────────────────
exports.register = async (event) => {
  try {
    const { name, email, phone, password, bloodGroup, emergencyContactName, emergencyContactPhone } = parseBody(event);
    if (!name || !email || !password) return badReq("Name, email and password are required.");
    if (password.length < 8)          return badReq("Password must be at least 8 characters.");

    // Format phone number for Cognito (E.164 format)
    const formattedPhone = phone ? formatPhoneNumber(phone) : null;
    if (phone && !formattedPhone) return badReq("Invalid phone number format. Please enter a valid phone number.");

    console.log("Attempting Cognito SignUp for:", email);
    const signup = await cognito.send(new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email.toLowerCase(),
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email.toLowerCase() },
        { Name: "name",  Value: name },
        ...(formattedPhone ? [{ Name: "phone_number", Value: formattedPhone }] : []),
      ],
    }));

    const userId = signup.UserSub;

    console.log("Attempting AdminConfirmSignUp for:", email);
    // Auto-confirm for hackathon (disable in production)
    await cognito.send(new AdminConfirmSignUpCommand({ UserPoolId: POOL_ID, Username: email.toLowerCase() }));

    // Format emergency contact phone
    const formattedEmergencyPhone = emergencyContactPhone ? formatPhoneNumber(emergencyContactPhone) : "";
    if (emergencyContactPhone && !formattedEmergencyPhone) return badReq("Invalid emergency contact phone number format.");

    console.log("Attempting DynamoDB PutItem for user:", userId);
    await dynamo.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: {
        userId, email: email.toLowerCase(), name,
        phone: formattedPhone || "", bloodGroup: bloodGroup || "",
        emergencyContactName: emergencyContactName || "",
        emergencyContactPhone: formattedEmergencyPhone || "",
        settings: { voiceMonitor: true, autoAlert: true, locationShare: false, nightMode: true },
        currentScore: 100, currentStatus: "SAFE", createdAt: nowIso(),
      },
      ConditionExpression: "attribute_not_exists(userId)",
    }));

    console.log("Successfully registered user:", email);
    return created({ message: "Welcome to SafeHer!", user: { userId, name, email, currentScore: 100, currentStatus: "SAFE" } });
  } catch (e) {
    // 🚨 THIS WILL TELL US THE EXACT AWS ERROR IN CLOUDWATCH 🚨
    console.error("REGISTER LAMBDA CRASHED:", e.name, e.message, e.$metadata);
    
    if (e.name === "UsernameExistsException") return badReq("Email already registered. Try signing in.");
    return err(e.message);
  }
};

// ── POST /auth/login ─────────────────────────────────────
exports.login = async (event) => {
  try {
    const { email, password } = parseBody(event);
    if (!email || !password) return badReq("Email and password required.");

    console.log("Attempting InitiateAuthCommand for:", email);
    const authRes = await cognito.send(new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: { USERNAME: email.toLowerCase(), PASSWORD: password },
    }));

    const { IdToken, AccessToken, RefreshToken } = authRes.AuthenticationResult;
    const payload = JSON.parse(Buffer.from(IdToken.split(".")[1], "base64").toString());
    const userId  = payload.sub;

    console.log("Fetching user profile from DynamoDB for:", userId);
    const profileRes = await dynamo.send(new GetCommand({ TableName: TABLES.USERS, Key: { userId } }));
    const user = profileRes.Item || { userId, email };

    return ok({ token: IdToken, accessToken: AccessToken, refreshToken: RefreshToken, user });
  } catch (e) {
    console.error("LOGIN LAMBDA CRASHED:", e.name, e.message);
    if (e.name === "NotAuthorizedException" || e.name === "UserNotFoundException")
      return unauth("Incorrect email or password.");
    return err(e.message);
  }
};

// ── GET /auth/profile ────────────────────────────────────
exports.getProfile = async (event) => {
  try {
    const userId = getUserId(event);
    if (!userId) return badReq("Unauthorized.");
    
    const res = await dynamo.send(new GetCommand({ TableName: TABLES.USERS, Key: { userId } }));
    if (!res.Item) return notFound("Profile not found.");
    
    return ok({ user: res.Item });
  } catch (e) { 
    console.error("GET PROFILE CRASHED:", e.name, e.message);
    return err(e.message); 
  }
};

// ── PUT /auth/settings ───────────────────────────────────
exports.updateSettings = async (event) => {
  try {
    const userId = getUserId(event);
    if (!userId) return badReq("Unauthorized.");
    const body = parseBody(event);
    
    const allowed = ["voiceMonitor", "autoAlert", "locationShare", "nightMode", "notifications"];
    const vals = {};
    allowed.forEach((k) => { if (body[k] !== undefined) vals[`:${k}`] = body[k]; });
    
    if (!Object.keys(vals).length) return badReq("No valid settings provided.");
    
    console.log("Updating settings for user:", userId);
    await dynamo.send(new UpdateCommand({
      TableName: TABLES.USERS, Key: { userId },
      UpdateExpression: `SET ${allowed.filter((k) => body[k] !== undefined).map((k) => `#s.${k} = :${k}`).join(", ")}`,
      ExpressionAttributeNames: { "#s": "settings" },
      ExpressionAttributeValues: vals,
    }));
    
    return ok({ message: "Settings saved!" });
  } catch (e) { 
    console.error("UPDATE SETTINGS CRASHED:", e.name, e.message);
    return err(e.message); 
  }
};