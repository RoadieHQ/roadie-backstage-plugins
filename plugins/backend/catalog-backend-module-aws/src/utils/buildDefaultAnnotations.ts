/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
