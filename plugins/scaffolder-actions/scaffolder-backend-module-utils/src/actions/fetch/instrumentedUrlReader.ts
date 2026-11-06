/*
 * Copyright 2026 Larder Software Limited
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
import { Readable, Transform } from 'stream';
import type {
  UrlReaderService,
  UrlReaderServiceReadTreeOptions,
  UrlReaderServiceReadTreeResponse,
  UrlReaderServiceReadTreeResponseDirOptions,
  UrlReaderServiceReadUrlOptions,
  UrlReaderServiceReadUrlResponse,
  UrlReaderServiceSearchOptions,
  UrlReaderServiceSearchResponse,
} from '@backstage/backend-plugin-api';

export interface InstrumentedReaderLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

class ProgressTrackingStream extends Transform {
  private bytesReceived = 0;
  private readonly startTime = Date.now();
  private lastByteTime = Date.now();
  private logger: InstrumentedReaderLogger;
  private progressInterval: NodeJS.Timeout | null = null;
  private stallTimeout: NodeJS.Timeout | null = null;
  private readonly stallTimeoutMs = 60000;
  private aborted = false;

  constructor(logger: InstrumentedReaderLogger, _url: string) {
    super();
    this.logger = logger;

    this.progressInterval = setInterval(() => {
      if (!this.aborted) {
        this.logger.info(
          `[DEBUG] Download progress: ${formatBytes(
            this.bytesReceived,
          )} received in ${formatDuration(Date.now() - this.startTime)}`,
        );
      }
    }, 5000);
    this.resetStallTimeout();
  }

  private resetStallTimeout(): void {
    if (this.stallTimeout) {
      clearTimeout(this.stallTimeout);
    }
    this.stallTimeout = setTimeout(() => {
      if (this.aborted) {
        return;
      }
      this.aborted = true;
      this.cleanup();
      const msg = `Download stalled after ${formatDuration(
        Date.now() - this.lastByteTime,
      )} with no data. Received ${formatBytes(this.bytesReceived)} total.`;
      this.logger.error(`[DEBUG] ${msg}`);
      this.destroy(new Error(msg));
    }, this.stallTimeoutMs);
  }

  private cleanup(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    if (this.stallTimeout) {
      clearTimeout(this.stallTimeout);
      this.stallTimeout = null;
    }
  }

  _transform(
    chunk: Buffer,
    _encoding: string,
    callback: (error?: Error | null, data?: Buffer) => void,
  ): void {
    if (this.aborted) {
      callback();
      return;
    }
    this.bytesReceived += chunk.length;
    this.lastByteTime = Date.now();
    this.resetStallTimeout();
    callback(null, chunk);
  }

  _flush(callback: (error?: Error | null) => void): void {
    this.cleanup();
    if (!this.aborted) {
      this.logger.info(
        `[DEBUG] Download complete: ${formatBytes(
          this.bytesReceived,
        )} received in ${formatDuration(Date.now() - this.startTime)}`,
      );
    }
    callback();
  }

  _destroy(
    error: Error | null,
    callback: (error?: Error | null) => void,
  ): void {
    this.cleanup();
    callback(error);
  }
}

class InstrumentedTreeResponse implements UrlReaderServiceReadTreeResponse {
  private readonly response: UrlReaderServiceReadTreeResponse;
  private readonly logger: InstrumentedReaderLogger;
  private readonly url: string;

  constructor(
    response: UrlReaderServiceReadTreeResponse,
    logger: InstrumentedReaderLogger,
    url: string,
  ) {
    this.response = response;
    this.logger = logger;
    this.url = url;

    const responseAny = response as Record<string, unknown>;
    if (
      responseAny.stream &&
      typeof (responseAny.stream as Readable).pipe === 'function'
    ) {
      const origStream = responseAny.stream as Readable;
      const progressStream = new ProgressTrackingStream(logger, url);
      responseAny.stream = origStream.pipe(progressStream);
    }
  }

  get etag(): string {
    return this.response.etag;
  }

  async files(): Promise<
    {
      path: string;
      content(): Promise<Buffer>;
      lastModifiedAt?: Date;
    }[]
  > {
    return this.response.files();
  }

  async archive(): Promise<NodeJS.ReadableStream> {
    return this.response.archive();
  }

  async dir(
    options?: UrlReaderServiceReadTreeResponseDirOptions,
  ): Promise<string> {
    const startTime = Date.now();
    this.logger.info(`[DEBUG] Starting dir() for: ${this.url}`);

    const result = await this.response.dir(options);

    this.logger.info(
      `[DEBUG] dir() complete in ${formatDuration(
        Date.now() - startTime,
      )} for: ${this.url}`,
    );
    return result;
  }
}

export function createInstrumentedReader(
  reader: UrlReaderService,
  logger: InstrumentedReaderLogger,
): UrlReaderService {
  return {
    async readUrl(
      url: string,
      options?: UrlReaderServiceReadUrlOptions,
    ): Promise<UrlReaderServiceReadUrlResponse> {
      return reader.readUrl(url, options);
    },

    async readTree(
      url: string,
      options?: UrlReaderServiceReadTreeOptions,
    ): Promise<UrlReaderServiceReadTreeResponse> {
      logger.info(`[DEBUG] Initiating readTree for: ${url}`);

      const readTreeStart = Date.now();
      let response: UrlReaderServiceReadTreeResponse;
      try {
        response = await reader.readTree(url, options);
      } catch (error) {
        const elapsed = formatDuration(Date.now() - readTreeStart);
        const message = error instanceof Error ? error.message : String(error);
        logger.error(
          `[DEBUG] readTree failed after ${elapsed} for: ${url} - ${message}`,
        );
        throw error;
      }

      const readTreeElapsed = formatDuration(Date.now() - readTreeStart);
      logger.info(
        `[DEBUG] readTree returned in ${readTreeElapsed} for: ${url} (etag: ${response.etag})`,
      );

      return new InstrumentedTreeResponse(response, logger, url);
    },

    async search(
      url: string,
      options?: UrlReaderServiceSearchOptions,
    ): Promise<UrlReaderServiceSearchResponse> {
      return reader.search(url, options);
    },
  };
}
