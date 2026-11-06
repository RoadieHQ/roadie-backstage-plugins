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
import { isError } from '@backstage/errors';
import {
  DefaultAzureDevOpsCredentialsProvider,
  getAzureCommitsUrl,
  getAzureDownloadUrl,
  getAzureFileFetchUrl,
  ScmIntegrationRegistry,
  ScmIntegrations,
} from '@backstage/integration';
import dns from 'dns';
import net from 'net';
import https from 'https';

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  name: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${name} timeout after ${ms}ms`)), ms),
    ),
  ]);
}

interface NetworkDiagnostics {
  dns: { ok: boolean; ips?: string[]; error?: string; ms: number };
  tcp: { ok: boolean; error?: string; ms: number };
  https: { ok: boolean; status?: number; error?: string; ms: number };
}

async function runNetworkDiagnostics(
  hostname: string,
  port: number = 443,
  timeoutMs: number = 10000,
): Promise<NetworkDiagnostics> {
  const result: NetworkDiagnostics = {
    dns: { ok: false, ms: 0 },
    tcp: { ok: false, ms: 0 },
    https: { ok: false, ms: 0 },
  };

  const dnsStart = Date.now();
  try {
    const ips = await withTimeout(
      dns.promises.resolve4(hostname),
      timeoutMs,
      'DNS',
    );
    result.dns = { ok: true, ips, ms: Date.now() - dnsStart };
  } catch (e) {
    const message = isError(e) ? e.message : String(e);
    result.dns = { ok: false, error: message, ms: Date.now() - dnsStart };
    return result;
  }

  const tcpStart = Date.now();
  try {
    await new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();
      socket.setTimeout(timeoutMs);
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('TCP timeout'));
      });
      socket.on('error', reject);
      socket.connect(port, hostname);
    });
    result.tcp = { ok: true, ms: Date.now() - tcpStart };
  } catch (e) {
    const message = isError(e) ? e.message : String(e);
    result.tcp = { ok: false, error: message, ms: Date.now() - tcpStart };
    return result;
  }

  const httpsStart = Date.now();
  try {
    const status = await new Promise<number>((resolve, reject) => {
      const req = https.request(
        { hostname, port, method: 'HEAD', path: '/', timeout: timeoutMs },
        res => resolve(res.statusCode ?? 0),
      );
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('HTTPS timeout'));
      });
      req.on('error', reject);
      req.end();
    });
    result.https = { ok: true, status, ms: Date.now() - httpsStart };
  } catch (e) {
    const message = isError(e) ? e.message : String(e);
    result.https = {
      ok: false,
      error: message,
      ms: Date.now() - httpsStart,
    };
  }

  return result;
}

export interface DebugLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

async function safeResponseBody(
  response: Response,
  maxLength: number = 1024,
): Promise<string> {
  try {
    const text = await response.text();
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength)}... (truncated, ${
      text.length
    } bytes total)`;
  } catch {
    return '(unable to read response body)';
  }
}

function isScmIntegrations(
  integrations: ScmIntegrationRegistry,
): integrations is ScmIntegrations {
  return 'azure' in integrations;
}

export interface DebugFetchResult {
  reachable: boolean;
  authFailureDetected: boolean;
  failedStatusCodes: number[];
}

export async function debugFetch(
  url: string,
  logger: DebugLogger,
  integrations?: ScmIntegrationRegistry,
): Promise<DebugFetchResult> {
  const result: DebugFetchResult = {
    reachable: false,
    authFailureDetected: false,
    failedStatusCodes: [],
  };

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    logger.error(`[DEBUG] Invalid URL: ${url}`);
    return result;
  }

  logger.info(`[DEBUG] Starting fetch debug for: ${url}`);
  logger.info(`[DEBUG] Hostname: ${hostname}`);

  logger.info(`[DEBUG] Running network diagnostics...`);
  const diag = await runNetworkDiagnostics(hostname);
  logger.info(
    `[DEBUG] DNS: ${
      diag.dns.ok
        ? `OK (${diag.dns.ms}ms, IPs: ${diag.dns.ips?.join(', ')})`
        : `FAILED - ${diag.dns.error}`
    }`,
  );
  logger.info(
    `[DEBUG] TCP:443: ${
      diag.tcp.ok ? `OK (${diag.tcp.ms}ms)` : `FAILED - ${diag.tcp.error}`
    }`,
  );
  logger.info(
    `[DEBUG] HTTPS: ${
      diag.https.ok
        ? `OK (${diag.https.ms}ms, status=${diag.https.status})`
        : `FAILED - ${diag.https.error}`
    }`,
  );

  if (!diag.dns.ok || !diag.tcp.ok) {
    logger.error(`[DEBUG] Network connectivity failed`);
    return result;
  }

  result.reachable = true;

  if (integrations && isScmIntegrations(integrations)) {
    const isAzure =
      hostname === 'dev.azure.com' ||
      integrations.azure.byUrl(url) !== undefined;

    if (isAzure) {
      const azureResult = await debugAzureFetch(url, integrations, logger);
      result.authFailureDetected = azureResult.authFailureDetected;
      result.failedStatusCodes = azureResult.failedStatusCodes;
    }
  }

  return result;
}

interface AzureDebugResult {
  authFailureDetected: boolean;
  failedStatusCodes: number[];
}

export async function debugAzureFetch(
  url: string,
  integrations: ScmIntegrations,
  logger: DebugLogger,
): Promise<AzureDebugResult> {
  const result: AzureDebugResult = {
    authFailureDetected: false,
    failedStatusCodes: [],
  };
  logger.info(`[DEBUG] Starting Azure-specific debugging for: ${url}`);

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    logger.error(`[DEBUG] Invalid Azure URL: ${url}`);
    return result;
  }

  logger.info(`[DEBUG] Checking Azure integration config...`);
  const integration = integrations.azure.byUrl(url);
  if (!integration) {
    logger.error(
      `[DEBUG] No Azure integration found for ${hostname}. Configured hosts: ${
        integrations.azure
          .list()
          .map(i => i.config.host)
          .join(', ') || 'none'
      }`,
    );
    return result;
  }
  logger.info(
    `[DEBUG] Azure integration found for host: ${integration.config.host}`,
  );

  logger.info(`[DEBUG] Checking authentication...`);
  const credentialsProvider =
    DefaultAzureDevOpsCredentialsProvider.fromIntegrations(integrations);
  const credentials = await credentialsProvider.getCredentials({ url });
  const azureHeaders = credentials?.headers ?? {};
  const authHeader = azureHeaders.Authorization;
  if (authHeader) {
    const authType = String(authHeader).split(' ')[0];
    logger.info(`[DEBUG] Auth configured: type=${authType}`);
  } else {
    logger.warn(
      `[DEBUG] No auth header configured - requests will be unauthenticated`,
    );
  }

  logger.info(`[DEBUG] Testing Azure Commits API...`);
  const commitsUrl = getAzureCommitsUrl(url);
  logger.info(`[DEBUG] Commits URL: ${commitsUrl}`);

  const commitsStart = Date.now();
  try {
    const commitsResponse = await fetch(commitsUrl, {
      headers: azureHeaders,
      signal: AbortSignal.timeout(30000),
    });
    const commitsMs = Date.now() - commitsStart;

    if (commitsResponse.status === 203) {
      const body = await safeResponseBody(commitsResponse);
      logger.error(
        `[DEBUG] Commits API returned 203 - Azure is returning a sign-in page. Auth token is missing or invalid. Body: ${body}`,
      );
      result.authFailureDetected = true;
      result.failedStatusCodes.push(203);
    } else if (commitsResponse.ok) {
      const commitsData = await commitsResponse.json();
      const commitId = commitsData?.value?.[0]?.commitId;
      logger.info(
        `[DEBUG] Commits API: OK (${commitsMs}ms, status=${
          commitsResponse.status
        }, latestCommit=${commitId?.substring(0, 8)}...)`,
      );
    } else {
      const body = await safeResponseBody(commitsResponse);
      logger.error(
        `[DEBUG] Commits API: FAILED (${commitsMs}ms, status=${commitsResponse.status} ${commitsResponse.statusText}). Body: ${body}`,
      );
      if (commitsResponse.status === 401 || commitsResponse.status === 403) {
        result.authFailureDetected = true;
      }
      result.failedStatusCodes.push(commitsResponse.status);
    }
  } catch (e) {
    const commitsMs = Date.now() - commitsStart;
    const message = isError(e) ? e.message : String(e);
    logger.error(
      `[DEBUG] Commits API: ERROR after ${commitsMs}ms - ${message}`,
    );
  }

  logger.info(`[DEBUG] Testing Azure Download API...`);
  const downloadUrl = getAzureDownloadUrl(url);
  logger.info(`[DEBUG] Download URL: ${downloadUrl}`);

  const downloadStart = Date.now();
  try {
    const downloadResponse = await fetch(downloadUrl, {
      headers: {
        ...azureHeaders,
        Accept: 'application/zip',
      },
      signal: AbortSignal.timeout(30000),
    });
    const downloadMs = Date.now() - downloadStart;

    if (downloadResponse.status === 203) {
      const body = await safeResponseBody(downloadResponse);
      logger.error(
        `[DEBUG] Download API returned 203 - sign-in page. Auth token is missing or invalid. Body: ${body}`,
      );
      result.authFailureDetected = true;
      result.failedStatusCodes.push(203);
    } else if (downloadResponse.ok) {
      const contentType =
        downloadResponse.headers.get('content-type') ?? 'not set';
      const contentLength =
        downloadResponse.headers.get('content-length') ?? 'unknown';
      logger.info(
        `[DEBUG] Download API: OK (${downloadMs}ms, status=${downloadResponse.status}, content-type=${contentType}, content-length=${contentLength})`,
      );
      if (!contentType.includes('zip') && !contentType.includes('octet')) {
        const body = await safeResponseBody(downloadResponse);
        logger.warn(
          `[DEBUG] Download API returned unexpected content-type: ${contentType}. Expected application/zip. Body: ${body}`,
        );
      }
    } else {
      const body = await safeResponseBody(downloadResponse);
      logger.error(
        `[DEBUG] Download API: FAILED (${downloadMs}ms, status=${downloadResponse.status} ${downloadResponse.statusText}). Body: ${body}`,
      );
      if (downloadResponse.status === 401 || downloadResponse.status === 403) {
        result.authFailureDetected = true;
      }
      result.failedStatusCodes.push(downloadResponse.status);
    }
  } catch (e) {
    const downloadMs = Date.now() - downloadStart;
    const message = isError(e) ? e.message : String(e);
    logger.error(
      `[DEBUG] Download API: ERROR after ${downloadMs}ms - ${message}`,
    );
  }

  logger.info(`[DEBUG] Testing Azure File API...`);
  const fileUrl = getAzureFileFetchUrl(url);
  logger.info(`[DEBUG] File URL: ${fileUrl}`);

  const fileStart = Date.now();
  try {
    const fileResponse = await fetch(fileUrl, {
      headers: azureHeaders,
      signal: AbortSignal.timeout(30000),
    });
    const fileMs = Date.now() - fileStart;

    if (fileResponse.status === 203) {
      const body = await safeResponseBody(fileResponse);
      logger.error(
        `[DEBUG] File API returned 203 - sign-in page. Auth token is missing or invalid. Body: ${body}`,
      );
      result.authFailureDetected = true;
      result.failedStatusCodes.push(203);
    } else if (fileResponse.ok) {
      logger.info(
        `[DEBUG] File API: OK (${fileMs}ms, status=${fileResponse.status})`,
      );
    } else {
      const body = await safeResponseBody(fileResponse);
      logger.error(
        `[DEBUG] File API: FAILED (${fileMs}ms, status=${fileResponse.status} ${fileResponse.statusText}). Body: ${body}`,
      );
      if (fileResponse.status === 401 || fileResponse.status === 403) {
        result.authFailureDetected = true;
      }
      result.failedStatusCodes.push(fileResponse.status);
    }
  } catch (e) {
    const fileMs = Date.now() - fileStart;
    const message = isError(e) ? e.message : String(e);
    logger.error(`[DEBUG] File API: ERROR after ${fileMs}ms - ${message}`);
  }

  logger.info(`[DEBUG] Azure fetch debug complete`);
  return result;
}
