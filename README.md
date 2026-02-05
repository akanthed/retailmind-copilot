# RetailMind Copilot

An AI-powered market intelligence platform that helps small and mid-sized retailers make smarter pricing and inventory decisions.

## What is RetailMind Copilot?

RetailMind Copilot is your personal AI assistant for retail business optimization. It helps retailers:

- **Monitor Competitor Prices**: Track competitor prices in real-time and identify pricing opportunities
- **Forecast Demand**: Predict future product demand with AI-powered machine learning to optimize inventory
- **Get Smart Recommendations**: Receive AI-driven action recommendations for pricing, promotions, and inventory management
- **Receive Instant Alerts**: Get notified about market changes, competitor price drops, and stocking risks
- **Ask Questions Naturally**: Use conversational AI to ask business questions and get instant insights in plain English
- **View Analytics Dashboard**: See all your key business metrics and market position in one place

### Who is it for?

Small and mid-sized retail store owners and managers who want to:
- Increase profit margins by optimizing prices
- Reduce inventory costs and stockouts
- Make faster, data-driven decisions
- Stay competitive in their market
- Save time on manual price and inventory monitoring

## Key Features

✅ **Real-time Competitor Price Monitoring** - Track prices from competitors automatically  
✅ **AI Demand Forecasting** - Predict product demand with 30-day forecasts  
✅ **Natural Language AI Copilot** - Ask questions like "Should I match competitor X's price?"  
✅ **Smart Recommendations** - Get specific actions to increase revenue and reduce costs  
✅ **Alert System** - Get notified of pricing opportunities and inventory risks  
✅ **Visual Dashboard** - See key metrics, trends, and market position at a glance  
✅ **Reports & Export** - Generate reports and export data in PDF/CSV formats  

## Try It Now

🚀 **Live Demo**: [https://retailmind-ai.vercel.app/](https://retailmind-ai.vercel.app/)

## Getting Started

### Prerequisites

- Node.js (v16 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm (comes with Node.js)

### Installation & Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd retailmind-copilot

# Install dependencies
npm i

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` with hot-reload enabled.

### Build for Production

```sh
npm run build
```

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite (fast development and optimized builds)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **UI Components**: shadcn-ui (accessible, customizable components)
- **Testing**: Vitest

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components (Dashboard, Alerts, Reports, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── main.tsx         # App entry point
```

## Deployment

The project is optimized for deployment to various platforms:

- **Vercel**: Push to GitHub and auto-deploy (see `vercel.json`)
- **AWS**: Use AWS CloudFront + S3 for static hosting with API Gateway
- **Other Platforms**: The production build can be deployed to any static hosting service

For platform-specific deployment steps, refer to the documentation of your chosen hosting provider.

## Development Workflow

1. **Edit Code**: Make changes to files in the `src/` directory
2. **Test Changes**: Use `npm run dev` to see live updates
3. **Run Tests**: Execute `npm run test` to run the test suite
4. **Build**: Run `npm run build` to create an optimized production build
5. **Commit**: Push your changes and they'll deploy automatically (if using Vercel)

## Available Commands

```sh
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run test      # Run tests
npm run lint      # Check code for linting issues
```

## Documentation

- See [design.md](design.md) for detailed system architecture and design decisions
- See [requirements.md](requirements.md) for complete feature specifications and user stories

## Contributing

Contributions are welcome! Feel free to open issues, create pull requests, or suggest improvements.

## License

This project is part of the AI for Bharat Hackathon initiative.

