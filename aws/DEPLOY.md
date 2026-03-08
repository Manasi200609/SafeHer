# 🛡️ SafeHer — AWS Deployment Guide

## What gets created (one command)

| # | AWS Service | Purpose | Free Tier |
|---|---|---|---|
| 1 | **Cognito** | User auth + JWT tokens | 50,000 MAU free |
| 2 | **API Gateway** | 14 REST endpoints (HTTPS) | 1M calls/month free |
| 3 | **Lambda** | All backend logic (14 functions) | 1M calls/month free |
| 4 | **DynamoDB** | Users, Contacts, Safety Logs | 25GB free |
| 5 | **SNS** | Real SMS to contacts on SOS | ~₹0.50/SMS |
| 6 | **S3** | Profile photos + media | 5GB free |
| 7 | **CloudWatch** | Ops dashboard + SOS alarms | Basic free |

**Total cost for hackathon demo: ₹0 + SMS cost**

---

## Step 1 — Prerequisites

```bash
# AWS CLI
https://aws.amazon.com/cli/

# Serverless Framework
npm install -g serverless

# Configure credentials
aws configure
# Paste: Access Key ID, Secret Access Key
# Region: ap-south-1
# Output format: json
```

---

## Step 2 — Install dependencies

```bash
cd aws/
npm init -y
npm install \
  @aws-sdk/client-dynamodb \
  @aws-sdk/lib-dynamodb \
  @aws-sdk/client-cognito-identity-provider \
  @aws-sdk/client-sns \
  @aws-sdk/client-cloudwatch \
  uuid

# Also install in the Lambda layer
cd layers/nodejs
npm init -y
npm install \
  @aws-sdk/client-dynamodb \
  @aws-sdk/lib-dynamodb \
  @aws-sdk/client-cognito-identity-provider \
  @aws-sdk/client-sns \
  @aws-sdk/client-cloudwatch \
  uuid
```

---

## Step 3 — Enable SNS SMS (needed for SOS alerts)

```bash
# Set SMS spending limit ($10 is fine for demo)
aws sns set-sms-attributes \
  --attributes DefaultSMSType=Transactional,MonthlySpendLimit=10

# If you're in sandbox mode, verify destination phones:
aws sns create-sms-sandbox-phone-number --phone-number +91XXXXXXXXXX
# Then enter the OTP sent to that number:
aws sns verify-sms-sandbox-phone-number \
  --phone-number +91XXXXXXXXXX \
  --one-time-password 123456
```

---

## Step 4 — Deploy everything

```bash
cd aws/
serverless deploy --stage prod
```

### What you'll see printed:
```
✔ Service deployed to stack safeher-prod

endpoints:
  POST - https://abc123.execute-api.ap-south-1.amazonaws.com/auth/register
  POST - https://abc123.execute-api.ap-south-1.amazonaws.com/auth/login
  GET  - https://abc123.execute-api.ap-south-1.amazonaws.com/auth/profile
  PUT  - https://abc123.execute-api.ap-south-1.amazonaws.com/auth/settings
  GET  - https://abc123.execute-api.ap-south-1.amazonaws.com/safety/status
  POST - https://abc123.execute-api.ap-south-1.amazonaws.com/safety/score
  POST - https://abc123.execute-api.ap-south-1.amazonaws.com/safety/sos
  ...

Stack Outputs:
  ApiUrl:     https://abc123.execute-api.ap-south-1.amazonaws.com
  UserPoolId: ap-south-1_AbCdEfGhI
  ClientId:   1a2b3c4d5e6f7g8h9i0j
  S3Bucket:   safeher-media-prod-123456789012
```

---

## Step 5 — Wire frontend to AWS

Open `frontend/aws-exports.js` and paste your outputs:

```js
const awsConfig = {
  awsEnabled: true,              // ← flip this!
  region: "ap-south-1",
  cognito: {
    userPoolId: "ap-south-1_AbCdEfGhI",   // ← from output
    clientId:   "1a2b3c4d5e6f7g8h9i0j",   // ← from output
  },
  apiGatewayUrl: "https://abc123.execute-api.ap-south-1.amazonaws.com",  // ← from output
  s3Bucket: "safeher-media-prod-123456789012",
};
```

Restart Expo: `npx expo start --clear`

---

## Step 6 — Test the demo moment 🎯

1. Register a new user in the app
2. Go to Guardian Circle → add a contact with a **real phone number**
3. Go to Home → tap **Alert Contacts**
4. Watch the SMS arrive on their phone!

That's the moment that wins hackathons.

---

## Architecture

```
📱 SafeHer App
       │
       ▼
🔐 AWS Cognito  (authentication + JWT)
       │
       ▼
🌐 API Gateway  (HTTPS endpoints)
       │
       ▼
⚡ Lambda Functions  (14 handlers)
       │
   ┌───┴──────────────┬──────────────┐
   ▼                  ▼              ▼
🗄️  DynamoDB       📱 SNS SMS     🪣 S3
(Users/Contacts/  (SOS alerts   (Profile
   Logs)          to guardians)  photos)
                               
📊 CloudWatch  (monitoring dashboard + SOS alarms)
```

---

## Full Product Additions

### AppSync (Real-time tracking)
```bash
npm install @aws-amplify/api-graphql

# Deploy AppSync API from serverless.yml
# Use GraphQL subscriptions for live location updates
# Guardians see user location update in real time
```

### SageMaker (AI Risk Scoring)
```bash
# Train a model on safety log data
# Features: time, location_risk, movement, voice_amplitude
# Deploy as SageMaker endpoint
# Call from Lambda: sagemaker-runtime.invokeEndpoint()
# Much more accurate than the weighted formula
```

### CloudWatch (Already included!)
- Dashboard: `https://console.aws.amazon.com/cloudwatch` → SafeHer-Ops
- Alarms fire when SOS is triggered
- Track high-risk events, API errors, Lambda timeouts

---

## Teardown

```bash
serverless remove --stage prod
# Deletes everything except DynamoDB data
```