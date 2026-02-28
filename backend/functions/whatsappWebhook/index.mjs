import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

export const handler = async (event) => {
  console.log("WhatsApp webhook invoked:", JSON.stringify(event));

  try {
    // Parse incoming WhatsApp message from Twilio
    const body = parseBody(event.body);
    
    // Extract message details
    const from = body.From; // User's WhatsApp number
    const userMessage = body.Body; // Message text
    const messageId = body.MessageSid;

    console.log(`Message from ${from}: ${userMessage}`);

    // Get AI response from Bedrock
    const aiResponse = await getBedrockResponse(userMessage);

    // Return TwiML response to send back via WhatsApp
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(aiResponse)}</Message>
</Response>`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/xml",
      },
      body: twimlResponse,
    };
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);

    // Return error message to user
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, I encountered an error. Please try again.</Message>
</Response>`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/xml",
      },
      body: errorResponse,
    };
  }
};

// Parse URL-encoded body from Twilio
function parseBody(body) {
  const params = new URLSearchParams(body);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// Get response from Amazon Bedrock Nova Pro
async function getBedrockResponse(userMessage) {
  const systemPrompt = `You are RetailMind AI, an intelligent pricing assistant for small retailers in India.

Your capabilities:
- Provide pricing recommendations based on competitor data
- Analyze market trends and demand patterns
- Give actionable business insights
- Answer questions about inventory and pricing strategy

Keep responses concise (2-3 sentences max) since this is WhatsApp.
Use Indian Rupees (₹) for all pricing.
Be friendly, professional, and helpful.`;

  const command = new ConverseCommand({
    modelId: "us.amazon.nova-pro-v1:0",
    messages: [
      {
        role: "user",
        content: [{ text: userMessage }],
      },
    ],
    system: [{ text: systemPrompt }],
    inferenceConfig: {
      maxTokens: 300,
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const response = await bedrock.send(command);
  const aiMessage = response.output.message.content[0].text;

  return aiMessage;
}

// Escape XML special characters for TwiML
function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
