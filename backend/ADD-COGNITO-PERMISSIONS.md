# Add Cognito Permissions to retailmind-dev User

Your IAM user needs Cognito permissions. Since you've hit the managed policy quota, use an **inline policy** instead:

## Steps (3 minutes) - Use Inline Policy

1. **Open AWS Console** → Sign in with admin/root account
2. **Go to IAM** → Users → Search for `retailmind-dev`
3. **Click on retailmind-dev** user
4. **Permissions tab** → Scroll down to "Inline policies" section
5. **Click "Create inline policy"**
6. **Click "JSON" tab**
7. **Paste this** (copy from below):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:CreateUserPool",
                "cognito-idp:CreateUserPoolClient",
                "cognito-idp:DescribeUserPool",
                "cognito-idp:DescribeUserPoolClient",
                "cognito-idp:ListUserPools",
                "cognito-idp:ListUserPoolClients",
                "cognito-idp:UpdateUserPool",
                "cognito-idp:UpdateUserPoolClient"
            ],
            "Resource": "*"
        }
    ]
}
```

8. **Click "Next"**
9. **Policy name**: `RetailMind-Cognito-Access`
10. **Click "Create policy"**

✅ Inline policies don't count against your quota!

## Alternative: If You Can't Access Admin Console

If you prefer minimal permissions:

1. In IAM → Policies → Click "Create policy"
2. Click "JSON" tab
3. Paste this:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:CreateUserPool",
                "cognito-idp:CreateUserPoolClient",
                "cognito-idp:DescribeUserPool",
                "cognito-idp:DescribeUserPoolClient",
                "cognito-idp:ListUserPools",
                "cognito-idp:ListUserPoolClients",
                "cognito-idp:UpdateUserPool",
                "cognito-idp:UpdateUserPoolClient"
            ],
            "Resource": "*"
        }
    ]
}
```

4. Click "Next"
5. Name: `RetailMind-Cognito-Access`
6. Click "Create policy"
7. Go back to Users → retailmind-dev → Add permissions
8. Attach the `RetailMind-Cognito-Access` policy

## Verify Permissions

After adding permissions, test in PowerShell:

```powershell
aws cognito-idp list-user-pools --max-results 10
```

If you see output (even if empty), permissions are working!

## Then Run Setup

```powershell
./backend/setup-cognito.ps1
```

This will create the User Pool and output the credentials you need.
