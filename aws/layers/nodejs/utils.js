const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient, GetCommand, PutCommand,
  UpdateCommand, DeleteCommand, QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "ap-south-1" }),
  { marshallOptions: { removeUndefinedValues: true } }
);

const TABLES = {
  USERS:    "SafeHer-Users",
  CONTACTS: "SafeHer-Contacts",
  LOGS:     "SafeHer-SafetyLogs",
};

const CORS = {
  "Content-Type":                 "application/json",
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

const res = (code, body) => ({
  statusCode: code,
  headers: CORS,
  body: JSON.stringify(body),
});

const ok       = (data)    => res(200, { success: true,  ...data });
const created  = (data)    => res(201, { success: true,  ...data });
const badReq   = (message) => res(400, { success: false, message });
const unauth   = (message) => res(401, { success: false, message });
const notFound = (message) => res(404, { success: false, message });
const err      = (message) => res(500, { success: false, message });

const decodeJwtSub = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(payload, "base64").toString("utf8");
    const data = JSON.parse(json);
    return data?.sub || null;
  } catch {
    return null;
  }
};

const getUserId  = (event) => {
  // Preferred path (when API Gateway JWT authorizer is enabled)
  const ctxSub = event?.requestContext?.authorizer?.jwt?.claims?.sub;
  if (ctxSub) return ctxSub;

  // Fallback path (no authorizer): parse Authorization header JWT
  const h = event?.headers || {};
  const auth = h.Authorization || h.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : auth;
  if (!token) return null;
  return decodeJwtSub(token);
};
const parseBody  = (event) => { try { return JSON.parse(event.body || "{}"); } catch { return {}; } };
const nowIso     = ()      => new Date().toISOString();
const ttl90days  = ()      => Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60;

const computeScore = (factors = {}) => {
  const h = new Date().getHours();
  const defaults = {
    timeOfDay:       h >= 22 || h < 5 ? 0.9 : h >= 20 ? 0.6 : h < 7 ? 0.5 : 0.1,
    areaRiskIndex:   0,
    movementAnomaly: 0,
    voiceDistress:   0,
  };
  const f = { ...defaults, ...factors };
  const raw = f.timeOfDay * 0.30 + f.areaRiskIndex * 0.25 + f.movementAnomaly * 0.25 + f.voiceDistress * 0.20;
  const score = Math.round(Math.max(0, Math.min(100, 100 - raw * 100)));
  const status = score >= 80 ? "SAFE" : score >= 50 ? "MEDIUM" : score >= 25 ? "HIGH" : "CRITICAL";
  return { score, status, factors: f };
};

module.exports = {
  dynamo, TABLES, randomUUID, nowIso, ttl90days, computeScore,
  ok, created, badReq, unauth, notFound, err,
  getUserId, parseBody,
  GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand,
};