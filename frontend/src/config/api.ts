/**
 * API Configuration
 * Reads from environment variables
 */

// Get API URL from environment variable
// In production: uses VITE_API_URL from .env.production
// In development: uses VITE_API_URL from .env.development
// Fallback: empty string (uses same domain - Vercel proxy)
export const API_URL = import.meta.env.VITE_API_URL || "";

export const config = {
  apiUrl: API_URL,
};

export default config;
