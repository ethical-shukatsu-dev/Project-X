"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"; // Import custom dialog components without DialogClose
import {Button} from "@/components/ui/button"; // Import your Button component
import {useTranslation} from "@/i18n-client"; // Import translation hook

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
  lng: string; // Add lng prop for translations
}

const SignupDialog: React.FC<SignupDialogProps> = ({open, onClose, lng}) => {
  const {t} = useTranslation(lng, "ai"); // Use translation for text

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 p-6 shadow-xl shadow-blue-500/10">
        <DialogTitle className="text-center text-2xl font-bold text-white">
          {t("cta.title") || "Ready to unlock your perfect career match?"}
        </DialogTitle>
        <DialogDescription className="text-center text-base text-white/80">
          {t("cta.subtitle") ||
            "Join BaseMe today and discover companies that align with your values."}
        </DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-4">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            <div className="mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mx-auto text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-white">
              {t("cta.benefit1.title") || "Personalized Matches"}
            </h3>
            <p className="text-sm text-white/70">
              {t("cta.benefit1.description") || "Powered by BaseMe AI"}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            <div className="mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mx-auto text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-white">
              {t("cta.benefit2.title") || "Get Discovered"}
            </h3>
            <p className="text-sm text-white/70">
              {t("cta.benefit2.description") || "By company scouts"}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            <div className="mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mx-auto text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="font-medium text-white">
              {t("cta.benefit3.title") || "Browse Companies"}
            </h3>
            <p className="text-sm text-white/70">
              {t("cta.benefit3.description") || "Access partner listings"}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105 active:scale-95"
          >
            {t("cta.primaryButton") || "Sign up with Email"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-white/90 hover:bg-white/5 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/10"
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
        </div>
        <div className="text-center text-sm text-white/60 mt-4">
          <p>
            {t("cta.disclaimer") ||
              "By signing up, you agree to our Terms and Privacy Policy."}
          </p>
        </div>
        <DialogClose className="absolute right-4 top-4 rounded-sm bg-white p-2  hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40" />
      </DialogContent>
    </Dialog>
  );
};

export default SignupDialog;
