/**
 * Google Authentication utility functions
 */

import { trackEvent } from '../analytics';
import { BASE_URL, DOMAIN } from '../constants/domain';
import { GoogleUser } from '../../types/google-auth';

interface BaseMeUserData {
  operation_status: string;
  selected_account_type: string;
  sign_up_version?: string;
  current_company_id?: string;
}

// Get Client ID securely from API endpoint
const getClientId = async (): Promise<string> => {
  try {
    const response = await fetch('/api/auth/google-config');
    if (!response.ok) {
      throw new Error('Failed to fetch Google client ID');
    }
    const data = await response.json();
    return data.clientId;
  } catch (error) {
    console.error('Failed to get Google Client ID:', error);
    return '';
  }
};

// Load the Google API script
export const loadGoogleApiScript = async (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load Google API in server-side context'));
      return;
    }

    const clientId = await getClientId();
    if (!clientId) {
      reject(new Error('Google Client ID is not configured'));
      return;
    }

    // Set up callback function for when the script is loaded
    window.onGoogleScriptLoad = () => {
      window.gapi.load('auth2', () => {
        console.log('clientId', clientId);
        try {
          window.gapi.auth2.init({
            client_id: clientId,
            scope: 'profile email',
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };

    // If script already exists, don't add it again
    if (document.getElementById('google-platform-script')) {
      if (window.gapi) {
        window.onGoogleScriptLoad();
      }
      return;
    }

    // Add the script to the document
    const script = document.createElement('script');
    console.log('script', script);
    script.id = 'google-platform-script';
    script.src = 'https://apis.google.com/js/platform.js?onload=onGoogleScriptLoad';
    script.async = true;
    script.defer = true;
    script.onerror = (error) => reject(error);
    document.head.appendChild(script);
  });
};

// Initiate Google Sign-In process
export const initiateGoogleSignIn = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot initiate Google Sign-In in server-side context');
  }

  try {
    // Ensure Google API is loaded
    await loadGoogleApiScript();

    // Get the Google Auth instance
    const auth2 = window.gapi.auth2.getAuthInstance();

    // Trigger Google Sign-In
    const googleUser = await auth2.signIn();

    console.log('googleUser', googleUser);
    // Process successful sign-in
    await handleGoogleSignInSuccess(googleUser);
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    // Show error to user
    alert('Google Sign-In failed. Please try again.');
  }
};

// Handle successful Google Sign-In
const handleGoogleSignInSuccess = async (googleUser: GoogleUser): Promise<void> => {
  try {
    // Get profile and auth response from Google
    const profile = googleUser.getBasicProfile();
    const authResponse = googleUser.getAuthResponse();

    // Get URL parameters for tracking and affiliates
    const urlParams = new URLSearchParams(window.location.search);
    const utmCampaign = urlParams.get('utm_campaign');
    let paramCampaignId = null;
    let paramAdsetId = null;

    if (utmCampaign) {
      const parts = utmCampaign.split('_');
      paramCampaignId = parts[0];
      paramAdsetId = parts[1];
    }

    // Handle affiliate code if present
    const affiliateCode = urlParams.get('student_affiliate_code');
    if (affiliateCode) {
      try {
        await fetch(`${BASE_URL}/api/v1/affiliate_codes/check`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ affiliate_code: affiliateCode }),
        });
        localStorage.setItem('student_affiliate_code', affiliateCode);
      } catch (error) {
        console.error('Error checking affiliate code:', error);
      }
    }

    // Create data object for BaseMe API
    const data = {
      provider: 'google_oauth2',
      uid: profile.getId(),
      id_token: authResponse.access_token,
      info: {
        email: profile.getEmail(),
        tmp_main_image: profile.getImageUrl(),
        family_name: profile.getFamilyName(),
        given_name: profile.getGivenName(),
        image_url: profile.getImageUrl(),
      },
      selected_account_type: 'student',
      utm_content: urlParams.get('utm_content') || localStorage.getItem('utm_content') || '',
      a8_params: urlParams.get('a8') || localStorage.getItem('a8_params') || '',
      campaign_id: paramCampaignId || localStorage.getItem('campaign_id') || '',
      adset_id: paramAdsetId || localStorage.getItem('adset_id') || '',
      ad_id: urlParams.get('utm_content') || localStorage.getItem('ad_id') || '',
      utm_term: urlParams.get('utm_term') || localStorage.getItem('utm_term') || '',
      user_invitation_code:
        urlParams.get('i') || localStorage.getItem('user_invitation_code') || '',
      shared_at: urlParams.get('t') || localStorage.getItem('shared_at') || '',
      student_invitation_code: urlParams.get('student_invitation_code') || '',
      student_affiliate_code:
        urlParams.get('student_affiliate_code') ||
        localStorage.getItem('student_affiliate_code') ||
        '',
      site_language: getCookie('site_language') || 'ja',
      agreement_version: 'v2',
    };

    // Track analytics for Google sign-up attempt
    trackEvent('signup_click', {
      method: 'google',
      source: 'google_button',
    }).catch((err) => console.error('Error tracking signup:', err));

    // Post the data to BaseMe API endpoint
    const response = await fetch(`${BASE_URL}/api/v1/accounts/google_oauth2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include', // Important for CORS with cookies
    });

    // Extract auth headers
    const accessToken = response.headers.get('access-token');
    const client = response.headers.get('client');
    const uid = response.headers.get('uid');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Authentication failed');
    }

    // Store auth headers if available
    if (accessToken && client && uid) {
      setCookie('_access_token', accessToken, 30);
      setCookie('_client', client, 30);
      setCookie('_uid', uid, 30);
    }

    const responseData = await response.json();

    // Clear localStorage items that are no longer needed
    removeLocalStorageParams();

    // Redirect based on account type and status
    redirectAfterLogin(responseData);
  } catch (error: unknown) {
    console.error('Authentication error:', error);
    if (error instanceof Error) {
      alert(error.message || 'Google authentication failed');
    } else {
      alert('Google authentication failed');
    }
  }
};

// Helper function to get a cookie value
const getCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number): void => {
  if (typeof document === 'undefined') return;

  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;domain=.${DOMAIN}`;
};

// Helper function to remove localStorage parameters
const removeLocalStorageParams = (): void => {
  if (typeof localStorage === 'undefined') return;

  const keysToRemove = [
    'utm_content',
    'a8_params',
    'student_affiliate_code',
    'campaign_id',
    'adset_id',
    'ad_id',
    'utm_term',
    'user_invitation_code',
    'shared_at',
  ];

  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

// Helper function to redirect after login
const redirectAfterLogin = (userData: BaseMeUserData): void => {
  // Check if there's a redirect path stored in cookies
  const redirectPath = getCookie('_redirectPathAfterLogin');

  // Get any query parameters from the current URL
  const currentUrlParams = new URLSearchParams(window.location.search);
  const queryString = currentUrlParams.toString() ? `?${currentUrlParams.toString()}` : '';

  if (redirectPath) {
    deleteCookie('_redirectPathAfterLogin');
    window.location.href = redirectPath + queryString;
    return;
  }

  // Otherwise redirect based on account type and status
  if (userData.operation_status === 'init') {
    if (userData.selected_account_type === 'company') {
      window.location.href = `${BASE_URL}/accounts/new/company${queryString}`;
    } else if (userData.sign_up_version === '2') {
      window.location.href = `${BASE_URL}/accounts/new/user${queryString}`;
    } else {
      window.location.href = `${BASE_URL}/accounts/new/student${queryString}`;
    }
  } else {
    // Redirect to appropriate dashboard
    if (userData.selected_account_type === 'company' && userData.current_company_id) {
      window.location.href = `${BASE_URL}/dashboard${queryString}`;
    } else {
      window.location.href = `${BASE_URL}/${queryString}`;
    }
  }
};

// Helper function to delete a cookie
const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${DOMAIN}`;
};
