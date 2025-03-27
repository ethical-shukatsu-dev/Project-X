export default function GoogleAuthHead() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Don't render the component if the client ID is not defined
  if (!googleClientId) {
    console.warn(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in environment variables"
    );
    return null;
  }

  return (
    <>
      <meta name="google-signin-client_id" content={googleClientId} />
      <meta
        httpEquiv="Content-Security-Policy"
        content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.gstatic.com https://accounts.google.com"
      />
    </>
  );
}
