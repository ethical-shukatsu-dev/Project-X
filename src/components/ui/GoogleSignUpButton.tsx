import {TFunction} from "i18next";
import {Button} from "./button";
import {initiateGoogleSignIn} from "@/lib/auth/googleAuth";
import {trackEvent} from "@/lib/analytics";
import {useState} from "react";
import GoogleSignInLoading from "./GoogleSignInLoading";

export default function GoogleSignUpButton({
  t,
  onClick,
}: {
  t: TFunction<string, string>;
  onClick?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle Google sign-in button click
  const handleGoogleSignIn = async () => {
    try {
      // Show loading indicator
      setIsLoading(true);
      
      // Track click event
      if (onClick) {
        onClick();
        // If custom onClick is provided, we hide the loader after it's done
        setIsLoading(false);
      } else {
        // If no custom onClick handler is provided, use default Google sign-in flow
        await trackEvent("signup_click", {
          method: "google",
          source: "google_button",
        });
        
        // Initiate Google sign-in
        await initiateGoogleSignIn();
        
        // Note: we don't set isLoading to false here because the page will redirect on success
        // If there's an error, it will be caught by the catch block and the loader will be hidden
      }
    } catch (error) {
      console.error("Error with Google sign-in:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full transition-all border sm:w-auto hover:scale-105 active:scale-95 backdrop-blur-sm border-white/10"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-5 h-5 mr-2"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {t("cta.secondaryButton") || "Continue with Google"}
      </Button>
      <GoogleSignInLoading visible={isLoading} />
    </>
  );
}
