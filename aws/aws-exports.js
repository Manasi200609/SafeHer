/**
 * SafeHer — AWS Configuration
 * After running `serverless deploy`, paste your outputs here.
 *
 * LOCAL DEV:  leave awsEnabled = false  →  uses Express server
 * HACKATHON:  set awsEnabled = true     →  uses full AWS stack
 */

const awsConfig = {
  awsEnabled: false,            // ← flip to true once deployed

  region: "ap-south-1",        // Mumbai — closest to India

  // ── Cognito ─────────────────────────────────────────────
  // From: serverless deploy output → "UserPoolId" + "UserPoolClientId"
  cognito: {
    userPoolId: "ap-south-1_XXXXXXXXX",
    clientId:   "XXXXXXXXXXXXXXXXXXXXXXXXXX",
  },

  // ── API Gateway ─────────────────────────────────────────
  // From: serverless deploy output → "ApiGatewayUrl"
  apiGatewayUrl: "https://XXXXXXXXXX.execute-api.ap-south-1.amazonaws.com",

  // ── Local Express (fallback) ─────────────────────────────
  // Run `ipconfig`, find your IPv4, paste below
  localApiUrl: "http://10.176.190.179:5000/api",

  // ── S3 ───────────────────────────────────────────────────
  s3Bucket: "safeher-media-prod",

  // ── AppSync (Full Product) ───────────────────────────────
  appSync: {
    endpoint: "https://XXXXXXXXXX.appsync-api.ap-south-1.amazonaws.com/graphql",
    region:   "ap-south-1",
    apiKey:   "da2-XXXXXXXXXX",
  },
};

export default awsConfig;