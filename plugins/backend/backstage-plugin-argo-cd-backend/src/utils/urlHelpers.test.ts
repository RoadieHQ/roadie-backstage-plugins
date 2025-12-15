import { buildArgoUrl } from './urlHelpers';

describe('buildArgoUrl', () => {
  it('preserves base URL path when appending API path', () => {
    const baseUrl = 'https://argo.example.com/prefix';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com/prefix/api/v1/applications');
  });

  it('works with base URL without path', () => {
    const baseUrl = 'https://argo.example.com';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com/api/v1/applications');
  });

  it('handles base URL with trailing slash', () => {
    const baseUrl = 'https://argo.example.com/prefix/';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com/prefix/api/v1/applications');
  });

  it('handles API path without leading slash', () => {
    const baseUrl = 'https://argo.example.com/prefix';
    const apiPath = 'api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com/prefix/api/v1/applications');
  });

  it('handles complex API paths with query parameters', () => {
    const baseUrl = 'https://argo.example.com/prefix';
    const apiPath = '/api/v1/applications/test-app?appNamespace=argocd';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com/prefix/api/v1/applications/test-app?appNamespace=argocd');
  });

  it('preserves base URL query parameters', () => {
    const baseUrl = 'https://argo.example.com/prefix?param=value';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com/prefix/api/v1/applications?param=value');
  });

  it('handles root path base URL', () => {
    const baseUrl = 'https://argo.example.com/';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com/api/v1/applications');
  });

  it('handles HTTP URLs (non-HTTPS)', () => {
    const baseUrl = 'http://argo.example.com';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('http://argo.example.com/api/v1/applications');
  });

  it('handles HTTP URLs with path prefix', () => {
    const baseUrl = 'http://argo.example.com/prefix';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('http://argo.example.com/prefix/api/v1/applications');
  });

  it('handles HTTPS URLs with port number', () => {
    const baseUrl = 'https://argo.example.com:8080';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com:8080/api/v1/applications');
  });

  it('handles HTTP URLs with port number', () => {
    const baseUrl = 'http://argo.example.com:3000';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('http://argo.example.com:3000/api/v1/applications');
  });

  it('handles HTTPS URLs with port and path prefix', () => {
    const baseUrl = 'https://argo.example.com:8443/prefix';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com:8443/prefix/api/v1/applications');
  });

  it('handles HTTP URLs with port and path prefix', () => {
    const baseUrl = 'http://argo.example.com:8080/prefix';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('http://argo.example.com:8080/prefix/api/v1/applications');
  });

  it('handles HTTPS URLs with default port (443) - port omitted in output', () => {
    const baseUrl = 'https://argo.example.com:443';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    // Note: URL.toString() omits default ports (443 for HTTPS, 80 for HTTP)
    expect(result).toBe('https://argo.example.com/api/v1/applications');
  });

  it('handles HTTP URLs with default port (80) - port omitted in output', () => {
    const baseUrl = 'http://argo.example.com:80';
    const apiPath = '/api/v1/applications';
    const result = buildArgoUrl(baseUrl, apiPath);
    // Note: URL.toString() omits default ports (443 for HTTPS, 80 for HTTP)
    expect(result).toBe('http://argo.example.com/api/v1/applications');
  });

  it('handles HTTP URLs with port, path prefix, and query parameters', () => {
    const baseUrl = 'http://argo.example.com:8080/prefix?param=value';
    const apiPath = '/api/v1/applications?appNamespace=argocd';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('http://argo.example.com:8080/prefix/api/v1/applications?param=value&appNamespace=argocd');
  });

  it('handles HTTPS URLs with port, path prefix, and query parameters', () => {
    const baseUrl = 'https://argo.example.com:8443/prefix?param=value';
    const apiPath = '/api/v1/applications?appNamespace=argocd';
    const result = buildArgoUrl(baseUrl, apiPath);
    expect(result).toBe('https://argo.example.com:8443/prefix/api/v1/applications?param=value&appNamespace=argocd');
  });
});

