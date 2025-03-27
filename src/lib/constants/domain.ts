export const DOMAIN = "staging.baseme.app";
export const LOCAL_URL = `http://localhost:4000`;
export const BASE_URL =
  process.env.NODE_ENV === "production" ? `https://${DOMAIN}` : LOCAL_URL;
