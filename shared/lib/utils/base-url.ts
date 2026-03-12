/**
 * Base URL utility
 * Centralized function to get the application base URL
 */

export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // If no base URL is set, use localhost for development
  if (!baseUrl) {
    return process.env.NODE_ENV === "development" 
      ? "http://localhost:3000" 
      : "https://www.kosyachts.com";
  }
  
  // If base URL doesn't have a scheme, add https
  if (!baseUrl.startsWith("http")) {
    return `https://${baseUrl}`;
  }
  
  return baseUrl;
}


