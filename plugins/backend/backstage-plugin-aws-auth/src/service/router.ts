/*
 * Copyright 2020 Spotify AB
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
import { Logger } from 'winston';
import Router from 'express-promise-router';
import express from 'express';
import { getAwsApiGenerateTempCredentialsForwarder } from './aws-api';

export async function createRouter(logger: Logger): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_ACCESS_KEY_SECRET = process.env.AWS_ACCESS_KEY_SECRET || process.env.AWS_SECRET_ACCESS_KEY;
  if (!AWS_ACCESS_KEY_ID || !AWS_ACCESS_KEY_SECRET) {
    logger.warn(
      'AWS_ACCESS_KEY_ID and AWS_ACCESS_KEY_SECRET (or AWS_SECRET_ACCESS_KEY) environment variables not set. Using default credentials provider chain.',
    );
  }
  const awsApiGenerateTempCredentialsForwarder = getAwsApiGenerateTempCredentialsForwarder({
    AWS_ACCESS_KEY_ID,
    AWS_ACCESS_KEY_SECRET,
    logger,
  });
  router.use('/credentials', awsApiGenerateTempCredentialsForwarder);

  return router;
}
