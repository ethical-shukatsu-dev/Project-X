"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {useTranslation} from "@/i18n-client";
import BounceCards from "@/components/ui/Components/BounceCards/BounceCards";
import CompanyCard from "@/components/ui/Components/BounceCards/CompanyCard";
import {RecommendationResult} from "@/lib/openai/client";

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
  lng: string;
  recommendations: RecommendationResult[];
}

const SignupDialog: React.FC<SignupDialogProps> = ({
  open,
  onClose,
  lng,
  recommendations,
}) => {
  const {t} = useTranslation(lng, "ai");

  // Create company cards for the first 5 recommendations
  const companyCards = recommendations
    .slice(0, 5)
    .map((rec) => (
      <CompanyCard
        key={rec.id || rec.company.id}
        name={rec.company.name}
        logoUrl={rec.company.logo_url}
      />
    ));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 p-6 shadow-xl shadow-blue-500/10 max-w-[90vw] md:max-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-bold text-center text-white whitespace-pre-line md:text-2xl">
          {t("cta.title") || "Ready to unlock your perfect career match?"}
        </DialogTitle>

        {/* Company Cards */}
        <div className="relative flex items-center justify-center w-full">
          <div className="w-full overflow-hidden">
            <BounceCards
              cards={companyCards}
              containerWidth={Math.min(
                600,
                Math.max(280, window.innerWidth * 0.6 - 48)
              )}
              containerHeight={Math.min(
                300,
                Math.max(200, window.innerWidth * 0.35)
              )}
              className="mx-auto"
              enableHover={true}
              transformStyles={[
                "rotate(5deg) translate(-180px)",
                "rotate(0deg) translate(-100px)",
                "rotate(-5deg)",
                "rotate(5deg) translate(100px)",
                "rotate(-5deg) translate(180px)",
              ]}
            />
          </div>
        </div>

        {/* Signup Buttons */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="w-full transition-all sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 active:scale-95"
          >
            {t("cta.primaryButton") || "Sign up with Email"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full transition-all border sm:w-auto hover:scale-105 active:scale-95 backdrop-blur-sm border-white/10"
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

        {/* Disclaimer */}
        <div className="mt-4 text-sm text-center text-white/60">
          <p>
            {t("cta.disclaimer") ||
              "By signing up, you agree to our Terms and Privacy Policy."}
          </p>
        </div>
        <DialogClose className="absolute p-2 transition-colors bg-white rounded-sm right-4 top-4 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40" />
      </DialogContent>
    </Dialog>
  );
};

export default SignupDialog;
