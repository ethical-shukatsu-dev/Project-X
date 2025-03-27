"use client";

import {useEffect, useState} from "react";

export default function GoogleAuthHead() {
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const response = await fetch("/api/auth/google-config");
        if (!response.ok) {
          throw new Error("Failed to fetch Google client ID");
        }
        const data = await response.json();
        setGoogleClientId(data.clientId);
      } catch (error) {
        console.error("Failed to get Google Client ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientId();
  }, []);

  // Don't render the component while loading or if the client ID is not defined
  if (loading || !googleClientId) {
    return null;
  }

  return <meta name="google-signin-client_id" content={googleClientId} />;
}
