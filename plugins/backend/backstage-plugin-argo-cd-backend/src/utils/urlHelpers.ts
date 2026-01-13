/**
 * Constructs a URL by appending a path to a base URL, preserving any existing path in the base URL.
 *
 * @param baseUrl - The base URL (may include a path, e.g., 'https://example.com/path')
 * @param apiPath - The API path to append (e.g., '/api/v1/applications')
 * @returns The complete URL with the base path preserved
 *
 * @example
 * buildArgoUrl('https://argo.example.com/prefix', '/api/v1/applications')
 * // Returns: 'https://argo.example.com/prefix/api/v1/applications'
 *
 * @example
 * buildArgoUrl('https://argo.example.com', '/api/v1/applications')
 * // Returns: 'https://argo.example.com/api/v1/applications'
 */
export function buildArgoUrl(baseUrl: string, apiPath: string): string {
  const base = new URL(baseUrl);

  // Split the API path into path and query string
  const [pathPart, queryString] = apiPath.split('?');

  // Remove leading slash from pathPart if present, we'll handle path joining properly
  const cleanApiPath = pathPart.startsWith('/') ? pathPart.slice(1) : pathPart;

  // Preserve the base pathname and append the API path
  // Ensure proper path joining (handle trailing slashes)
  const basePath = base.pathname.endsWith('/')
    ? base.pathname.slice(0, -1) // Remove trailing slash
    : base.pathname;

  base.pathname = basePath ? `${basePath}/${cleanApiPath}` : `/${cleanApiPath}`;

  // If there's a query string in the apiPath, parse and merge it with existing query params
  if (queryString) {
    const queryParams = new URLSearchParams(queryString);
    queryParams.forEach((value, key) => {
      base.searchParams.set(key, value);
    });
  }

  return base.toString();
}
