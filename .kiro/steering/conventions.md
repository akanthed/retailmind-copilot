# Development Conventions

## Documentation Policy

**CRITICAL**: Do not create unnecessary markdown files. Token usage matters.

- Never create summary/status/progress .md files unless explicitly requested
- Use existing documentation in `docs/` folder
- Avoid generating reports or documentation as deliverables
- Keep responses concise without creating files to "document" work done

## Code Style

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use async/await over promises
- Handle errors with try/catch in Lambda functions
- Always include CORS headers in Lambda responses
- Use ESM imports (`.mjs` for Lambda, `.ts`/`.tsx` for frontend)

## AWS Conventions

- All DynamoDB tables prefixed with `RetailMind-`
- Lambda functions return proper HTTP status codes (200, 201, 400, 404, 500)
- Always log events at function entry: `console.log('Function invoked:', JSON.stringify(event))`
- Include `Access-Control-Allow-Origin: *` in all API responses
- Use `us-east-1` region consistently

## Currency & Formatting

- Use Indian Rupees (₹) for all pricing
- Format prices with proper separators (e.g., ₹1,064,200)
- Use ISO timestamps for dates
- Confidence scores as decimals (0.0-1.0)
