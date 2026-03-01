# Manual Cognito Setup Guide

Since the IAM user lacks permissions to create Cognito resources via CLI, follow these steps in the AWS Console:

## Option 1: Add Permissions (Requires Admin Access)

If you have access to an AWS admin account:

1. Go to IAM Console → Users → retailmind-dev
2. Click "Add permissions" → "Attach policies directly"
3. Click "Create policy" and use this JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:*"
            ],
            "Resource": "*"
        }
    ]
}
```

4. Name it "RetailMind-Cognito-Policy"
5. Attach it to retailmind-dev user
6. Run: `./backend/setup-cognito.ps1`

## Option 2: Manual Console Setup (No Admin Needed)

### Step 1: Create User Pool

1. Go to AWS Console → Cognito → User Pools
2. Click "Create user pool"
3. **Sign-in options**: Email
4. **Password policy**: 
   - Minimum length: 8
   - Require uppercase, lowercase, numbers
   - No symbols required
5. **MFA**: OFF
6. **User account recovery**: Email only
7. **Self-registration**: Enabled
8. **Email provider**: Cognito (default)
9. **User pool name**: `RetailMind-Users`
10. **App client name**: `RetailMind-WebApp`
11. **Authentication flows**: 
    - ✅ ALLOW_USER_PASSWORD_AUTH
    - ✅ ALLOW_REFRESH_TOKEN_AUTH
    - ✅ ALLOW_USER_SRP_AUTH
12. Click "Create user pool"

### Step 2: Get Configuration Values

After creation:

1. Click on your User Pool
2. Copy the **User Pool ID** (format: `us-east-1_xxxxxxxxx`)
3. Go to "App integration" tab
4. Click on "RetailMind-WebApp" client
5. Copy the **Client ID** (long alphanumeric string)

### Step 3: Add to .env.local

```env
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Add Custom Attribute (Optional)

1. In User Pool → "Sign-up experience" tab
2. Click "Add custom attribute"
3. Name: `shop_name`
4. Type: String
5. Save

## Verification

Test the setup:
```powershell
# Check if User Pool exists
aws cognito-idp list-user-pools --max-results 10

# If you see RetailMind-Users, you're good to go!
```

## Next Steps

Once Cognito is configured:

```powershell
# 1. Create users table
./backend/create-users-table.ps1

# 2. Deploy user tracking
./backend/deploy-user-tracking.ps1

# 3. Wire to API Gateway
./backend/wire-user-tracking.ps1

# 4. Restart dev server
npm run dev
```

Then visit: http://localhost:5173/signup
