# AWS Cognito Authentication Setup Guide

This guide walks you through setting up AWS Cognito authentication for RetailMind AI.

## Prerequisites

- AWS CLI configured with appropriate credentials
- PowerShell (for Windows) or Bash (for Linux/Mac)
- Node.js and npm installed

## Step 1: Create DynamoDB Users Table

This table tracks user activity and analytics.

```powershell
./backend/create-users-table.ps1
```

This creates the `RetailMind-Users` table with:
- Primary key: `userId` (String)
- Global Secondary Index: `EmailIndex` on `email`

## Step 2: Setup AWS Cognito User Pool

Run the Cognito setup script:

```powershell
./backend/setup-cognito.ps1
```

This script will:
1. Create a Cognito User Pool named "RetailMind-Users"
2. Configure email-based authentication
3. Set password policy (min 8 chars, uppercase, lowercase, numbers)
4. Create a User Pool Client for the web app
5. Output environment variables

**Save the output!** You'll need these values:
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`

## Step 3: Configure Environment Variables

Add the Cognito credentials to your `.env.local` file:

```env
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Deploy User Tracking Lambda

Deploy the Lambda function that tracks user activity:

```powershell
./backend/deploy-user-tracking.ps1
```

## Step 5: Wire User Tracking to API Gateway

Connect the Lambda to your API Gateway:

```powershell
./backend/wire-user-tracking.ps1
```

This creates the endpoint: `POST /users/activity`

## Step 6: Install Frontend Dependencies

The auth implementation requires AWS SDK:

```bash
npm install @aws-sdk/client-cognito-identity-provider
```

## Step 7: Restart Development Server

Restart your dev server to load the new environment variables:

```bash
npm run dev
```

## Testing Authentication

1. Navigate to `http://localhost:5173/signup`
2. Create a new account with:
   - Shop name
   - Email address
   - Password (min 8 chars, uppercase, lowercase, numbers)
3. Check your email for a confirmation code
4. Enter the confirmation code
5. Sign in at `http://localhost:5173/login`

## User Flow

1. **Signup** → User creates account
2. **Email Confirmation** → User receives code via email
3. **Confirm Account** → User enters code
4. **Login** → User signs in with email/password
5. **Protected Routes** → User can access dashboard and features
6. **Logout** → User signs out (Settings page)

## Tracking User Activity

The system automatically tracks:
- User signups (in Cognito)
- Login events (in DynamoDB)
- Last seen timestamp
- Login count
- Shop name and email

View user data in DynamoDB:
```bash
aws dynamodb scan --table-name RetailMind-Users
```

## Security Features

- Passwords hashed by Cognito (never stored in plain text)
- Email verification required
- JWT tokens for session management
- Tokens stored in localStorage
- Protected routes require authentication
- CORS enabled for API endpoints

## Troubleshooting

### "VITE_COGNITO_CLIENT_ID is not configured"
- Make sure `.env.local` has the Cognito variables
- Restart your dev server after adding variables

### "User is not confirmed"
- User needs to confirm email with the code sent
- Resend code from the signup page

### "Incorrect username or password"
- Check email and password are correct
- Password must meet requirements (8+ chars, uppercase, lowercase, numbers)

### API Gateway 403 Forbidden
- Run `./backend/wire-user-tracking.ps1` to grant permissions
- Check Lambda function exists: `aws lambda get-function --function-name RetailMind-UserTracking`

## Cost Estimate

AWS Cognito pricing (as of 2024):
- First 50,000 MAUs (Monthly Active Users): Free
- Beyond 50,000: $0.0055 per MAU

For a small retail business with <1000 users: **FREE**

## Next Steps

- Customize email templates in Cognito console
- Add password reset functionality
- Implement refresh token rotation
- Add social login (Google, Facebook)
- Set up MFA (Multi-Factor Authentication)
