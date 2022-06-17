import { STS } from '@aws-sdk/client-sts';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';

type BuildDefaultAnnotationsOptions = {
  credentials: any;
  providerName: string;
  roleArn: string;
};

export const buildDefaultAnnotations = async ({
  credentials,
  providerName,
  roleArn,
}: BuildDefaultAnnotationsOptions) => {
  const sts = new STS({ credentials });

  const account = await sts.getCallerIdentity({});

  const defaultAnnotations: { [name: string]: string } = {
    [ANNOTATION_LOCATION]: `${providerName}:${roleArn}`,
    [ANNOTATION_ORIGIN_LOCATION]: `${providerName}:${roleArn}`,
  };

  if (account.Account) {
    defaultAnnotations['amazon.com/account-id'] = account.Account;
  }

  return defaultAnnotations;
};
