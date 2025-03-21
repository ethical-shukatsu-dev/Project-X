"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {useTranslation} from "@/i18n-client";
import BounceCards from "@/components/ui/Components/BounceCards/BounceCards";
import CompanyCard from "@/components/ui/Components/BounceCards/CompanyCard";
import {RecommendationResult} from "@/lib/openai/client";
import {Button} from "../ui/button";

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
            onClick={() => {
              window.location.href = "https://baseme.app/auth/students/signup";
            }}
            className="w-full p-4 text-white transition-all rounded-md sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 active:scale-95"
          >
            {t("cta.primaryButton") || "Sign up with Email"}
          </Button>

          {/* <GoogleSignUpButton t={t} /> */}
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
