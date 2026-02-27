import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const region = import.meta.env.VITE_AWS_REGION || "us-east-1";
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

const cognitoClient = new CognitoIdentityProviderClient({ region });

function assertClientId() {
  if (!userPoolClientId) {
    throw new Error("VITE_COGNITO_CLIENT_ID is not configured");
  }
}

export async function signIn(email: string, password: string) {
  assertClientId();

  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: userPoolClientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const response = await cognitoClient.send(command);
  return response.AuthenticationResult;
}

export async function signUp(email: string, password: string, shopName: string) {
  assertClientId();

  const command = new SignUpCommand({
    ClientId: userPoolClientId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "custom:shop_name", Value: shopName },
    ],
  });

  return cognitoClient.send(command);
}

export async function confirmSignUp(email: string, code: string) {
  assertClientId();

  const command = new ConfirmSignUpCommand({
    ClientId: userPoolClientId,
    Username: email,
    ConfirmationCode: code,
  });

  return cognitoClient.send(command);
}
