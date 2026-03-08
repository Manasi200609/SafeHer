/**
 * SafeHer — Contacts Lambdas
 * list   →  GET    /contacts
 * add    →  POST   /contacts
 * update →  PUT    /contacts/{id}
 * remove →  DELETE /contacts/{id}
 */

const {
  dynamo, TABLES, randomUUID, nowIso,
  ok, created, badReq, notFound, err,
  getUserId, parseBody,
  QueryCommand, PutCommand, UpdateCommand, DeleteCommand,
} = require("/opt/nodejs/utils");

exports.list = async (event) => {
  try {
    console.log("--- GET /contacts ---");
    console.log("Headers received:", JSON.stringify(event.headers));
    
    const userId = getUserId(event);
    console.log("Resolved UserID:", userId);
    
    if (!userId) return badReq("Unauthorized. Missing or invalid token.");

    const res = await dynamo.send(new QueryCommand({
      TableName: TABLES.CONTACTS,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    }));
    const contacts = (res.Items || []).sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    return ok({ count: contacts.length, contacts });
  } catch (e) { 
    console.error("GET CONTACTS CRASHED:", e);
    return err(e.message); 
  }
};

exports.add = async (event) => {
  try {
    console.log("--- POST /contacts ---");
    const userId = getUserId(event);
    console.log("Resolved UserID:", userId);
    
    if (!userId) return badReq("Unauthorized. Missing or invalid token.");
    
    const { name, phone, role, isPrimary, email: cEmail } = parseBody(event);
    if (!name || !phone) return badReq("Name and phone are required.");

    const countRes = await dynamo.send(new QueryCommand({
      TableName: TABLES.CONTACTS,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
      Select: "COUNT",
    }));
    
    if ((countRes.Count || 0) >= 10) return badReq("Maximum 10 guardians allowed.");

    const contactId = randomUUID();
    const initials  = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    const contact   = {
      userId, contactId, name, phone,
      email: cEmail || "", role: role || "Guardian",
      isPrimary: isPrimary || false, isActive: true,
      initials, createdAt: nowIso(),
    };

    console.log("Saving contact to DynamoDB:", contactId);
    await dynamo.send(new PutCommand({ TableName: TABLES.CONTACTS, Item: contact }));
    return created({ message: `${name} added to your Guardian Circle!`, contact });
  } catch (e) { 
    console.error("ADD CONTACT CRASHED:", e);
    return err(e.message); 
  }
};

exports.update = async (event) => {
  try {
    const userId    = getUserId(event);
    const contactId = event.pathParameters?.id;
    if (!userId || !contactId) return badReq("Unauthorized.");
    
    const body = parseBody(event);
    const allowed = ["name", "phone", "role", "isPrimary", "isActive"];
    const parts = [], vals = {}, names = {};
    
    allowed.forEach((k) => {
      if (body[k] !== undefined) {
        parts.push(`#${k} = :${k}`); vals[`:${k}`] = body[k]; names[`#${k}`] = k;
      }
    });
    
    if (!parts.length) return badReq("No fields to update.");
    
    await dynamo.send(new UpdateCommand({
      TableName: TABLES.CONTACTS, Key: { userId, contactId },
      UpdateExpression: `SET ${parts.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: vals,
      ConditionExpression: "attribute_exists(contactId)",
    }));
    return ok({ message: "Contact updated!" });
  } catch (e) {
    if (e.name === "ConditionalCheckFailedException") return notFound("Contact not found.");
    console.error("UPDATE CONTACT CRASHED:", e);
    return err(e.message);
  }
};

exports.remove = async (event) => {
  try {
    const userId    = getUserId(event);
    const contactId = event.pathParameters?.id;
    if (!userId || !contactId) return badReq("Unauthorized.");
    
    await dynamo.send(new DeleteCommand({
      TableName: TABLES.CONTACTS, Key: { userId, contactId },
      ConditionExpression: "attribute_exists(contactId)",
    }));
    return ok({ message: "Contact removed." });
  } catch (e) {
    if (e.name === "ConditionalCheckFailedException") return notFound("Contact not found.");
    console.error("REMOVE CONTACT CRASHED:", e);
    return err(e.message);
  }
};