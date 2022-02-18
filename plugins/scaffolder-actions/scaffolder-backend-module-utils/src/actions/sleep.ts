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

import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { InputError } from '@backstage/errors';

export function createSleepAction(options?: { maxSleep?: number }) {
  return createTemplateAction<{ amount: number }>({
    id: 'roadiehq:utils:sleep',
    description: 'Halts the scaffolding for the given amount of seconds',
    schema: {
      input: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: {
            title: 'Sleep Amount',
            description: 'How much seconds should this step take.',
            type: 'number',
          },
        },
      },
    },
    async handler(ctx) {
      if (isNaN(ctx.input?.amount)) {
        throw new InputError('amount must be a number');
      } else if (options?.maxSleep && ctx.input.amount > options.maxSleep) {
        throw new InputError(
          `sleep amount can not be greater than maxSleep. amount: ${ctx.input.amount}, maxSleep: ${options.maxSleep}`,
        );
      }
      ctx.logger.info(`Waiting ${ctx.input.amount} seconds`);

      await new Promise(resolve => {
        setTimeout(resolve, ctx.input.amount * 1000);
      });
    },
  });
}
