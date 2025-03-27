/**
 * Global type declarations for the Google API
 */

// Extend the Window interface to include Google API properties
interface Window {
  onGoogleScriptLoad: () => void;
  gapi: {
    load: (api: string, callback: () => void) => void;
    auth2: {
      init: (params: {client_id: string; scope: string}) => unknown;
      getAuthInstance: () => {
        signIn: () => Promise<GoogleUser>;
      };
    };
  };
}

// Google User interface
interface GoogleUser {
  getBasicProfile: () => {
    getId: () => string;
    getEmail: () => string;
    getImageUrl: () => string;
    getFamilyName: () => string;
    getGivenName: () => string;
  };
  getAuthResponse: () => {
    access_token: string;
    id_token: string;
  };
} 