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

import {Config} from "@backstage/config";
import * as winston from "winston";
import {AWSIAMUserProvider, AWSLambdaFunctionProvider, AWSS3BucketProvider} from "./providers";
import {RunnableEntityProvider} from "./types";

export class AWSEntityProvidersFactory {
    static fromConfig(config: Config, options: { logger: winston.Logger }): RunnableEntityProvider[] {
        const accountId = config.getString('accountId');
        const roleArn = config.getString('roleArn');
        const externalId = config.getOptionalString('externalId');
        const region = config.getString('region');

        return [
          new AWSIAMUserProvider({ accountId, roleArn, externalId, region }, options),
          new AWSLambdaFunctionProvider({ accountId, roleArn, externalId, region }, options),
          new AWSS3BucketProvider({ accountId, roleArn, externalId, region }, options)
        ]
    }
}
