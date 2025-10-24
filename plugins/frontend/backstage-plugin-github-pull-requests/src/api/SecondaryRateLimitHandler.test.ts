
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

import { SecondaryRateLimitHandler } from './SecondaryRateLimitHandler';

describe('SecondaryRateLimitHandler', () => {
  let handler: SecondaryRateLimitHandler;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset the singleton instance before each test
    (SecondaryRateLimitHandler as any).instance = undefined;
    handler = SecondaryRateLimitHandler.getInstance();
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = SecondaryRateLimitHandler.getInstance();
      const instance2 = SecondaryRateLimitHandler.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('executeWithBackoff', () => {
    it('should execute successful requests immediately', async () => {
      const mockRequest = jest.fn().mockResolvedValue('success');

      const result = await handler.executeWithBackoff(mockRequest);

      expect(result).toBe('success');
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should retry on secondary rate limit errors', async () => {
      const secondaryRateLimitError = {
        response: {
          status: 403,
          data: { message: 'secondary rate limit exceeded' },
          headers: { 'x-ratelimit-remaining': '100' },
        },
      };

      const mockRequest = jest.fn()
        .mockRejectedValueOnce(secondaryRateLimitError)
        .mockResolvedValue('success');

      const result = await handler.executeWithBackoff(mockRequest);

      expect(result).toBe('success');
      expect(mockRequest).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledWith(
        'Secondary rate limit hit (attempt 1/6)'
      );
    });

    it('should handle primary rate limit errors with reset time', async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 1; // 1 second from now
      const primaryRateLimitError = {
        response: {
          status: 403,
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': resetTime.toString(),
          },
        },
      };

      const mockRequest = jest.fn()
        .mockRejectedValueOnce(primaryRateLimitError)
        .mockResolvedValue('success');

      const result = await handler.executeWithBackoff(mockRequest);

      expect(result).toBe('success');
      expect(mockRequest).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Primary rate limit hit, waiting')
      );
    });

    it('should use retry-after header when available', async () => {
      const secondaryRateLimitError = {
        response: {
          status: 403,
          data: { message: 'secondary rate limit exceeded' },
          headers: {
            'x-ratelimit-remaining': '100',
            'retry-after': '1', // 1 second
          },
        },
      };

      const mockRequest = jest.fn()
        .mockRejectedValueOnce(secondaryRateLimitError)
        .mockResolvedValue('success');

      const result = await handler.executeWithBackoff(mockRequest);

      expect(result).toBe('success');
      expect(console.log).toHaveBeenCalledWith(
        'Waiting 1000ms before retry...'
      );
    });

    it('should fail after maximum retries are exceeded', async () => {
      const secondaryRateLimitError = {
        response: {
          status: 403,
          data: { message: 'secondary rate limit exceeded' },
          headers: { 'x-ratelimit-remaining': '100' },
        },
      };

      const mockRequest = jest.fn().mockRejectedValue(secondaryRateLimitError);

      const resultPromise = handler.executeWithBackoff(mockRequest, 2);

      // Fast-forward all timers to skip the exponential backoff delays
      jest.runAllTimers();

      await expect(resultPromise).rejects.toEqual(secondaryRateLimitError);
      expect(mockRequest).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 10000);

    it('should reject immediately on non-rate-limit errors', async () => {
      const genericError = new Error('Generic API error');
      const mockRequest = jest.fn().mockRejectedValue(genericError);

      await expect(handler.executeWithBackoff(mockRequest)).rejects.toEqual(genericError);
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle requests with custom max retries', async () => {
      const secondaryRateLimitError = {
        response: {
          status: 403,
          data: { message: 'secondary rate limit exceeded' },
          headers: { 'x-ratelimit-remaining': '100' },
        },
      };

      const mockRequest = jest.fn().mockRejectedValue(secondaryRateLimitError);

      await expect(handler.executeWithBackoff(mockRequest, 1)).rejects.toEqual(secondaryRateLimitError);
      expect(mockRequest).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should reset backoff multiplier on successful requests', async () => {
      const secondaryRateLimitError = {
        response: {
          status: 403,
          data: { message: 'secondary rate limit exceeded' },
          headers: { 'x-ratelimit-remaining': '100' },
        },
      };

      // First request fails then succeeds - should reset backoff
      const mockRequest1 = jest.fn()
        .mockRejectedValueOnce(secondaryRateLimitError)
        .mockResolvedValue('success1');

      await handler.executeWithBackoff(mockRequest1);

      // Second request should start with base backoff again
      const mockRequest2 = jest.fn().mockResolvedValue('success2');
      const result = await handler.executeWithBackoff(mockRequest2);

      expect(result).toBe('success2');
      expect(mockRequest2).toHaveBeenCalledTimes(1);
    });
  });

  describe('isSecondaryRateLimit', () => {
    it('should identify secondary rate limit by message content', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'You have exceeded the secondary rate limit' },
          headers: { 'x-ratelimit-remaining': '100' },
        },
      };

      expect((handler as any).isSecondaryRateLimit(error)).toBe(true);
    });

    it('should identify secondary rate limit by abuse detection message', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Abuse detection mechanism triggered' },
          headers: { 'x-ratelimit-remaining': '100' },
        },
      };

      expect((handler as any).isSecondaryRateLimit(error)).toBe(true);
    });

    it('should identify secondary rate limit by "too many requests" message', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Too many requests in a short time' },
          headers: { 'x-ratelimit-remaining': '100' },
        },
        message: 'Request failed',
      };

      expect((handler as any).isSecondaryRateLimit(error)).toBe(true);
    });

    it('should not identify primary rate limit as secondary', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Rate limit exceeded' },
          headers: { 'x-ratelimit-remaining': '0' },
        },
      };

      expect((handler as any).isSecondaryRateLimit(error)).toBe(false);
    });

    it('should return false for non-403 errors', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'secondary rate limit exceeded' },
          headers: { 'x-ratelimit-remaining': '100' },
        },
      };

      expect((handler as any).isSecondaryRateLimit(error)).toBe(false);
    });

    it('should return false for errors without response', () => {
      const error = new Error('Network error');

      expect((handler as any).isSecondaryRateLimit(error)).toBe(false);
    });
  });

  describe('isPrimaryRateLimit', () => {
    it('should identify primary rate limit correctly', () => {
      const error = {
        response: {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0' },
        },
      };

      expect((handler as any).isPrimaryRateLimit(error)).toBe(true);
    });

    it('should not identify secondary rate limit as primary', () => {
      const error = {
        response: {
          status: 403,
          headers: { 'x-ratelimit-remaining': '100' },
        },
      };

      expect((handler as any).isPrimaryRateLimit(error)).toBe(false);
    });

    it('should return false for non-403 errors', () => {
      const error = {
        response: {
          status: 429,
          headers: { 'x-ratelimit-remaining': '0' },
        },
      };

      expect((handler as any).isPrimaryRateLimit(error)).toBe(false);
    });

    it('should return false for errors without response', () => {
      const error = new Error('Network error');

      expect((handler as any).isPrimaryRateLimit(error)).toBe(false);
    });
  });

  describe('extractRetryAfter', () => {
    it('should extract retry-after header value', () => {
      const error = {
        response: {
          headers: { 'retry-after': '60' },
        },
      };

      const result = (handler as any).extractRetryAfter(error);
      expect(result).toBe(60000); // 60 seconds in milliseconds
    });

    it('should return default for secondary rate limits documentation', () => {
      const error = {
        response: {
          data: {
            documentation_url: 'https://docs.github.com/secondary-rate-limits',
          },
        },
      };

      const result = (handler as any).extractRetryAfter(error);
      expect(result).toBe(60000);
    });

    it('should return null for invalid retry-after value', () => {
      const error = {
        response: {
          headers: { 'retry-after': 'invalid' },
        },
      };

      const result = (handler as any).extractRetryAfter(error);
      expect(result).toBe(null);
    });

    it('should return null when no retry-after header exists', () => {
      const error = {
        response: {
          headers: {},
        },
      };

      const result = (handler as any).extractRetryAfter(error);
      expect(result).toBe(null);
    });

    it('should return null for errors without response', () => {
      const error = new Error('Network error');

      const result = (handler as any).extractRetryAfter(error);
      expect(result).toBe(null);
    });
  });

  describe('extractRateLimitReset', () => {
    it('should extract rate limit reset time', () => {
      const resetTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const error = {
        response: {
          headers: { 'x-ratelimit-reset': resetTime.toString() },
        },
      };

      const result = (handler as any).extractRateLimitReset(error);
      expect(result).toBe(resetTime * 1000);
    });

    it('should return null for invalid reset time', () => {
      const error = {
        response: {
          headers: { 'x-ratelimit-reset': 'invalid' },
        },
      };

      const result = (handler as any).extractRateLimitReset(error);
      expect(result).toBe(null);
    });

    it('should return null when no reset header exists', () => {
      const error = {
        response: {
          headers: {},
        },
      };

      const result = (handler as any).extractRateLimitReset(error);
      expect(result).toBe(null);
    });

    it('should return null for errors without response', () => {
      const error = new Error('Network error');

      const result = (handler as any).extractRateLimitReset(error);
      expect(result).toBe(null);
    });
  });

  describe('queue processing', () => {
    it('should process multiple requests', async () => {
      const mockRequest1 = jest.fn().mockResolvedValue('result1');
      const mockRequest2 = jest.fn().mockResolvedValue('result2');

      const [result1, result2] = await Promise.all([
        handler.executeWithBackoff(mockRequest1),
        handler.executeWithBackoff(mockRequest2),
      ]);

      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      expect(mockRequest1).toHaveBeenCalledTimes(1);
      expect(mockRequest2).toHaveBeenCalledTimes(1);
    });

    it('should handle queue processing errors gracefully', async () => {
      const error = new Error('Processing error');
      const mockRequest = jest.fn().mockRejectedValue(error);

      await expect(handler.executeWithBackoff(mockRequest)).rejects.toEqual(error);
    });
  });

});