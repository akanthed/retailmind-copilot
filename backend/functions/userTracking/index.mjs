import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "RetailMind-Users";

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Content-Type': 'application/json'
};

export const handler = async (event) => {
  console.log('User tracking invoked:', JSON.stringify(event));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path || event.resource;
    const method = event.httpMethod;

    // POST /users/activity - Track user activity
    if (path.includes('/activity') && method === 'POST') {
      const body = JSON.parse(event.body);
      const { userId, email, shopName, activity } = body;

      if (!userId || !email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'userId and email are required' })
        };
      }

      const timestamp = new Date().toISOString();

      // Check if user exists
      const getResult = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId }
      }));

      if (getResult.Item) {
        // Update existing user
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { userId },
          UpdateExpression: 'SET lastActivity = :activity, lastSeen = :timestamp, loginCount = if_not_exists(loginCount, :zero) + :one',
          ExpressionAttributeValues: {
            ':activity': activity,
            ':timestamp': timestamp,
            ':zero': 0,
            ':one': 1
          }
        }));
      } else {
        // Create new user record
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            userId,
            email,
            shopName: shopName || 'Unknown',
            createdAt: timestamp,
            lastSeen: timestamp,
            lastActivity: activity,
            loginCount: 1
          }
        }));
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Activity tracked' })
      };
    }

    // GET /users/{userId} - Get user info
    if (path.includes('/users/') && method === 'GET') {
      const userId = event.pathParameters?.userId;

      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'userId is required' })
        };
      }

      const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId }
      }));

      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'User not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item)
      };
    }

    // GET /users - List all users (admin)
    if (path === '/users' && method === 'GET') {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        Limit: 100
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          users: result.Items || [],
          count: result.Count || 0
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
