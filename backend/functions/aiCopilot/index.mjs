// RetailMind AI Copilot - Lambda Function
// This function uses Amazon Bedrock to answer business questions

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

export const handler = async (event) => {
    console.log('AI Copilot invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const userQuery = body.query || body.message;
        
        if (!userQuery) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing query parameter'
                })
            };
        }
        
        // System prompt for RetailMind AI
        const systemPrompt = `You are RetailMind AI, an intelligent pricing and inventory assistant for small and mid-sized retailers.

Your role:
- Help retailers make smart pricing decisions
- Analyze competitor pricing data
- Provide inventory recommendations
- Explain market trends in simple terms
- Give specific, actionable advice with numbers

Guidelines:
- Be concise and professional
- Use Indian Rupees (₹) for prices
- Provide specific recommendations when possible
- If you don't have data, say so clearly
- Always explain your reasoning

Current context:
- Retailer has ~100 products in electronics category
- Monitoring 3 main competitors
- Focus on pricing optimization and inventory management`;

        // Call Amazon Nova Pro (Latest AWS AI Model - Dec 2024)
        const input = {
            modelId: "us.amazon.nova-pro-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                text: `${systemPrompt}\n\nUser Question: ${userQuery}\n\nProvide a helpful, specific response:`
                            }
                        ]
                    }
                ],
                inferenceConfig: {
                    max_new_tokens: 1000,
                    temperature: 0.7,
                    top_p: 0.9
                }
            })
        };
        
        console.log('Calling Amazon Nova Pro...');
        const command = new InvokeModelCommand(input);
        const response = await client.send(command);
        
        // Parse Nova response
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const aiResponse = responseBody.output.message.content[0].text;
        
        console.log('Amazon Nova response received');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                query: userQuery,
                response: aiResponse,
                timestamp: new Date().toISOString(),
                model: "amazon-nova-pro",
                confidence: 0.90
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Failed to process query',
                message: error.message
            })
        };
    }
};
