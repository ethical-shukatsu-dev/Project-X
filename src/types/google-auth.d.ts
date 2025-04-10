/**
 * Global type declarations for the Google API
 */

declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      auth2: {
        init: (params: { client_id: string; scope: string }) => unknown;
        getAuthInstance: () => {
          signIn: () => Promise<GoogleUser>;
        };
      };
    };
    onGoogleScriptLoad: () => void;
  }
}

export interface GoogleUser {
  getBasicProfile(): {
    getId(): string;
    getEmail(): string;
    getImageUrl(): string;
    getFamilyName(): string;
    getGivenName(): string;
  };
  getAuthResponse(): {
    access_token: string;
  };
}

export {};
