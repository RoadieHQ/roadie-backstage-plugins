/*
 * Copyright 2025 Larder Software Limited
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

export class SecondaryRateLimitHandler {
  private static instance: SecondaryRateLimitHandler;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minDelay = 1000;
  private backoffMultiplier = 1;
  private maxBackoff = 60000; // 1 minute

  static getInstance(): SecondaryRateLimitHandler {
    if (!this.instance) {
      this.instance = new SecondaryRateLimitHandler();
    }
    return this.instance;
  }

  async executeWithBackoff<T>(request: () => Promise<T>, maxRetries = 5): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            // Apply current backoff delay
            const timeSinceLastRequest = Date.now() - this.lastRequestTime;
            const currentDelay = this.minDelay * this.backoffMultiplier;
            const waitTime = Math.max(0, currentDelay - timeSinceLastRequest);

            if (waitTime > 0) {
              await new Promise(res => setTimeout(res, waitTime));
            }

            this.lastRequestTime = Date.now();
            const result = await request();

            // Success - reset backoff
            this.backoffMultiplier = 1;
            resolve(result);
            return;

          } catch (error: any) {
            lastError = error;

            if (this.isSecondaryRateLimit(error)) {
              // eslint-disable-next-line no-console
              console.warn(`Secondary rate limit hit (attempt ${attempt + 1}/${maxRetries + 1})`);

              const retryAfter = this.extractRetryAfter(error);
              const backoffDelay = retryAfter || (Math.pow(2, attempt) * 1000);

              this.backoffMultiplier = Math.min(
                this.backoffMultiplier * 2,
                this.maxBackoff / this.minDelay
              );

              if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                continue;
              }
            } else if (this.isPrimaryRateLimit(error)) {
              // Handle primary rate limit differently
              const resetTime = this.extractRateLimitReset(error);
              if (resetTime && attempt < maxRetries) {
                const waitTime = resetTime - Date.now() + 1000; // Some buffer time
                // eslint-disable-next-line no-console
                console.warn(`Primary rate limit hit, waiting ${waitTime}ms until reset`);
                await new Promise(res => setTimeout(res, waitTime));
                continue;
              }
            }

            // If we get here, either it's not a rate limit error or we've exhausted retries
            break;
          }
        }

        reject(lastError || new Error('Unknown error during request execution'));
      });

      this.processQueue();
    });
  }

  private isSecondaryRateLimit(error: any): boolean {
    if (!error?.response) return false;

    const status = error.response.status;
    const message = error.message?.toLowerCase() || '';
    const body = error.response.data?.message?.toLowerCase() || '';

    // GitHub secondary rate limit indicators
    return (
      status === 403 &&
      (
        message.includes('secondary rate limit') ||
        body.includes('secondary rate limit') ||
        body.includes('abuse detection') ||
        body.includes('too many requests') ||
        error.response?.headers?.['x-ratelimit-remaining'] !== '0'
      )
    );
  }

  private isPrimaryRateLimit(error: any): boolean {
    if (!error?.response) return false;

    const status = error.response.status;
    const remaining = error.response?.headers?.['x-ratelimit-remaining'];

    return status === 403 && remaining === '0';
  }

  private extractRetryAfter(error: any): number | null {
    const retryAfter = error.response?.headers?.['retry-after'];
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      return isNaN(seconds) ? null : seconds * 1000;
    }

    const message = error.response?.data?.documentation_url;
    if (message?.includes('secondary-rate-limits')) {
      return 60000;
    }

    return null;
  }

  private extractRateLimitReset(error: any): number | null {
    const reset = error.response?.headers?.['x-ratelimit-reset'];
    if (reset) {
      const resetTime = parseInt(reset, 10) * 1000;
      return isNaN(resetTime) ? null : resetTime;
    }
    return null;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      await request();
    }

    this.isProcessing = false;
  }
}