// RetailMind AI Copilot - Lambda Function (Meta Llama Version)
// Alternative using Meta Llama 3 (instant access, no approval)

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
        const systemPrompt = `You are RetailMind AI, an intelligent pricing and inventory assistant for small and mid-sized retailers in India.

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

        // Call Meta Llama 3
        const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

${userQuery}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

        const input = {
            modelId: "meta.llama3-70b-instruct-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                prompt: prompt,
                max_gen_len: 1000,
                temperature: 0.7,
                top_p: 0.9
            })
        };
        
        console.log('Calling Bedrock Llama...');
        const command = new InvokeModelCommand(input);
        const response = await client.send(command);
        
        // Parse Llama response
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const aiResponse = responseBody.generation.trim();
        
        console.log('Bedrock Llama response received');
        
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
                model: "meta-llama-3-70b",
                confidence: 0.85
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
