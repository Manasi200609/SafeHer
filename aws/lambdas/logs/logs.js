/**
 * SafeHer — Logs Lambdas
 * list  →  GET /logs
 * stats →  GET /logs/stats
 */

const {
  dynamo, TABLES,
  ok, badReq, err,
  getUserId,
  QueryCommand,
} = require("/opt/nodejs/utils");

exports.list = async (event) => {
  try {
    console.log("--- GET /logs ---");
    const userId = getUserId(event);
    console.log("Resolved UserID:", userId);
    
    if (!userId) return badReq("Unauthorized. Missing or invalid token.");
    
    const limit  = parseInt(event.queryStringParameters?.limit  || "20");
    const isSOS  = event.queryStringParameters?.isSOS === "true";
    
    // Safely build the DynamoDB query parameters
    const queryParams = {
      TableName: TABLES.LOGS,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
      ScanIndexForward: false, 
      Limit: limit,
    };

    if (isSOS) {
      queryParams.FilterExpression = "isSOS = :t";
      queryParams.ExpressionAttributeValues[":t"] = true;
    }

    console.log("Querying DynamoDB for logs...");
    const res = await dynamo.send(new QueryCommand(queryParams));
    
    return ok({ count: res.Items?.length || 0, logs: res.Items || [] });
  } catch (e) { 
    console.error("GET LOGS CRASHED:", e);
    return err(e.message); 
  }
};

exports.stats = async (event) => {
  try {
    console.log("--- GET /logs/stats ---");
    const userId = getUserId(event);
    console.log("Resolved UserID:", userId);
    
    if (!userId) return badReq("Unauthorized. Missing or invalid token.");
    
    console.log("Fetching all logs for stats aggregation...");
    const res = await dynamo.send(new QueryCommand({
      TableName: TABLES.LOGS,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
      ScanIndexForward: false,
    }));
    
    const logs = res.Items || [];
    const breakdown = logs.reduce((a, l) => { a[l.status] = (a[l.status] || 0) + 1; return a; }, {});
    
    const statsResult = {
      stats: {
        total: logs.length,
        sos: logs.filter((l) => l.isSOS).length,
        safe: breakdown.SAFE || 0,
        breakdown,
        avgScore: logs.length ? Math.round(logs.reduce((s, l) => s + (l.score || 0), 0) / logs.length) : 100,
        latest: logs[0] || null,
      },
    };
    
    console.log("Stats calculated successfully.");
    return ok(statsResult);
  } catch (e) { 
    console.error("GET STATS CRASHED:", e);
    return err(e.message); 
  }
};