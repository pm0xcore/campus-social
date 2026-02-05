export const env = {
  // Auth
  NEXT_PUBLIC_AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID,
  NEXT_PUBLIC_AUTH_SANDBOX:
    (process.env.NEXT_PUBLIC_AUTH_SANDBOX ?? "true") === "true",
  JWKS_URL: process.env.JWKS_URL,

  // Analytics
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
};
