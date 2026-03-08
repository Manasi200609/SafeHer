/**
 * SafeHer — AWS Configuration (frontend)
 * After running `serverless deploy` in /aws, copy the real outputs here.
 *
 * LOCAL DEV:  leave awsEnabled = false  → uses local Express server
 * PRODUCTION: set awsEnabled = true     → uses full AWS stack
 */

const awsConfig = {
  awsEnabled: true, // now using full AWS stack

  region: "ap-south-1",

  // ── Cognito ─────────────────────────────────────────────
  // From: serverless deploy output → "UserPoolId" + "ClientId"
  cognito: {
    userPoolId: "ap-south-1_keu4r0uQT",
    clientId: "50p5n9ao25649j1viofg0j1ovm",
  },

  // ── API Gateway ─────────────────────────────────────────
  // From: serverless deploy output → "ApiUrl"
  apiGatewayUrl:"https://wsvc4df22g.execute-api.ap-south-1.amazonaws.com",
  // ── Local Express (fallback) ─────────────────────────────
  // Run `ipconfig`, find your IPv4, paste below (keep /api suffix)
  localApiUrl: "http://10.176.190.179:5000/api",

  // ── S3 ───────────────────────────────────────────────────
  // From: serverless deploy output → "S3Bucket"
  s3Bucket: "safeher-prod-mediabucket-tnoeyge9itw0",

  // ── AppSync (optional, full product) ─────────────────────
  appSync: {
    endpoint: "https://XXXXXXXXXX.appsync-api.ap-south-1.amazonaws.com/graphql",
    region: "ap-south-1",
    apiKey: "da2-XXXXXXXXXX",
  },
};

export default awsConfig;
