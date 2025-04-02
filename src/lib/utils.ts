import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a URL with preserved query parameters
 * @param baseUrl - The base URL to navigate to (e.g., "/en/admin")
 * @param searchParams - The current search parameters from useSearchParams()
 * @param options - Additional options
 * @param options.exclude - Array of parameter names to exclude
 * @param options.include - Object of parameter names and values to include/override
 * @returns Complete URL with query parameters
 */
export function createUrlWithParams(
  baseUrl: string,
  searchParams: URLSearchParams,
  options: {
    exclude?: string[];
    include?: Record<string, string>;
  } = {}
): string {
  // Create a copy of the current search params
  const params = new URLSearchParams(searchParams.toString());
  
  // Remove excluded parameters
  if (options.exclude) {
    options.exclude.forEach(param => params.delete(param));
  }
  
  // Add or override included parameters
  if (options.include) {
    Object.entries(options.include).forEach(([key, value]) => {
      params.set(key, value);
    });
  }
  
  // Construct the final URL
  const queryString = params.toString();
  const hasQueryInBaseUrl = baseUrl.includes('?');
  
  if (!queryString) {
    return baseUrl;
  }
  
  if (hasQueryInBaseUrl) {
    return `${baseUrl}&${queryString}`;
  }
  
  return `${baseUrl}?${queryString}`;
}
