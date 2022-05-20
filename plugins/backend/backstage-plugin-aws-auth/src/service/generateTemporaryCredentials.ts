import AWS from 'aws-sdk';

export async function generateTemporaryCredentials(
  AWS_ACCESS_KEY_ID?: string,
  AWS_ACCESS_KEY_SECRET?: string,
  AWS_ROLE_ARN?: string
) {
  const defaultSessionDuration: number = 900;
  if (AWS_ACCESS_KEY_ID && AWS_ACCESS_KEY_SECRET) {
    AWS.config.credentials = new AWS.Credentials({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_ACCESS_KEY_SECRET,
    });
  }

  if (AWS_ROLE_ARN) {
    return await new AWS.STS()
      .assumeRole({
        RoleArn: AWS_ROLE_ARN,
        RoleSessionName: 'backstage-plugin-aws-auth',
        DurationSeconds: defaultSessionDuration,
      })
      .promise();
  }

  return await new AWS.STS()
    .getSessionToken({
      DurationSeconds: defaultSessionDuration,
    })
    .promise();
}
