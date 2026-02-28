/**
 * Resolves a URL through the Home Assistant integration proxy if it's a relative path.
 * The integration provides a proxy at /api/bom_local/proxy/
 */
export function resolveImageUrl(url: string, serviceUrl?: string): string {
  if (!url) return url;
  
  // If URL is already absolute (starts with http:// or https://), use as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If we are using the HA integration proxy (standard behavior now)
  const proxyPrefix = '/api/bom_local/proxy';
  
  // Remove leading slash if present to avoid double slashes
  const path = url.startsWith('/') ? url : `/${url}`;
  
  return `${proxyPrefix}${path}`;
}
