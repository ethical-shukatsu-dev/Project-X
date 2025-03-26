import Head from "next/head";

export default function GoogleAuthHead() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  // Don't render the component if the client ID is not defined
  if (!googleClientId) {
    console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in environment variables");
    return null;
  }
  
  return (
    <Head>
      <meta
        name="google-signin-client_id"
        content={googleClientId}
      />
      <script
        id="google-platform-script"
        src="https://apis.google.com/js/platform.js"
        async
        defer
      />
    </Head>
  );
}
