import twilio from "twilio";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

const client = twilio(accountSid, authToken);

export const handler = async (event) => {
  console.log("WhatsApp sender invoked:", JSON.stringify(event));

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { to, message, contentSid, contentVariables } = body;

    if (!to || (!message && !contentSid)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Missing required fields: 'to' and either 'message' or 'contentSid'",
        }),
      };
    }

    // Format phone number for WhatsApp
    const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    // Prepare message options
    const messageOptions = {
      from: twilioNumber,
      to: toNumber,
    };

    // Use content template or plain message
    if (contentSid) {
      messageOptions.contentSid = contentSid;
      if (contentVariables) {
        messageOptions.contentVariables = JSON.stringify(contentVariables);
      }
    } else {
      messageOptions.body = message;
    }

    // Send message via Twilio
    const twilioMessage = await client.messages.create(messageOptions);

    console.log("Message sent successfully:", twilioMessage.sid);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        messageSid: twilioMessage.sid,
        status: twilioMessage.status,
      }),
    };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to send WhatsApp message",
        details: error.message,
      }),
    };
  }
};
