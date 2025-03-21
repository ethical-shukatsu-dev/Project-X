import React, {useState, useEffect} from "react";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Company} from "@/lib/supabase/client";
import {useTranslation} from "@/i18n-client";
import {ExternalLink, EyeOff, PartyPopper, ThumbsDown} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Link from "next/link";
import {LOCALSTORAGE_KEYS} from "@/lib/constants/localStorage";

interface CompanyCardProps {
  company: Company;
  matchingPoints: string[];
  onFeedback: (feedback: "interested" | "not_interested") => void;
  feedback?: "interested" | "not_interested";
  lng: string;
}

export default function CompanyCard({
  company,
  matchingPoints,
  onFeedback,
  feedback,
  lng,
}: CompanyCardProps) {
  const {t, loaded} = useTranslation(lng, "ai");
  const [logoError, setLogoError] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [wasAnonymous, setWasAnonymous] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<boolean>(false);

  // Check if we're in a browser environment before accessing localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(
        LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES
      );
      setIsAnonymous(storedValue === "true");
    }
  }, []);

  // Track when the card changes from anonymous to revealed state
  useEffect(() => {
    // If we have feedback and were previously in anonymous mode
    if (feedback && isAnonymous) {
      setWasAnonymous(true);
      setIsRevealing(true);

      // Show confetti animation for "interested" feedback
      if (feedback === "interested") {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      }

      // Reset the revealing animation state after animation completes
      const timer = setTimeout(() => {
        setIsRevealing(false);
      }, 2000); // Match this with the CSS animation duration

      return () => clearTimeout(timer);
    }
  }, [feedback, isAnonymous]);

  // Handle providing feedback with animations
  const handleFeedback = (type: "interested" | "not_interested") => {
    // If in anonymous mode, add a small delay to make the reveal more dramatic
    if (isAnonymous) {
      setTimeout(() => {
        onFeedback(type);
      }, 300);
    } else {
      onFeedback(type);
    }
  };

  // Get company initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // If translations are not loaded yet, show a loading state
  if (!loaded) {
    return <Card className="w-full p-6">Loading...</Card>;
  }

  // Determine if company details should be anonymized
  const shouldAnonymize = isAnonymous && !feedback;

  // Generate a company placeholder name if anonymized
  const getAnonymousName = () => {
    return `Company ${company.id.substring(0, 3).toUpperCase()}`;
  };

  // Sanitize company description to remove mentions of company name
  const getSanitizedDescription = (
    description: string,
    companyName: string
  ) => {
    if (!description || !companyName) return description;

    // Get the localized replacement text for "this company"
    const replacementText = t("recommendations.thisCompany");

    // Create a safe version of the company name to use in a regex
    // Escape special regex characters and handle potential Japanese characters
    const safeCompanyName = companyName
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
      .trim();

    // Split the company name by spaces and common separators to handle partial matches
    const nameParts = safeCompanyName.split(
      /[\s,\.・株式会社|Inc\.|Corporation|Corp\.|Co\.|Ltd\.]+/
    );

    // Filter out too short name parts (likely to cause false positives)
    const significantNameParts = nameParts.filter((part) => part.length > 1);

    let sanitized = description;

    // Replace the full company name
    const fullNameRegex = new RegExp(safeCompanyName, "gi");
    sanitized = sanitized.replace(fullNameRegex, replacementText);

    // For Japanese company names with 株式会社 (Corporation), also check without it
    if (companyName.includes("株式会社")) {
      const nameWithoutCorp = companyName.replace("株式会社", "").trim();
      const corpRegex = new RegExp(nameWithoutCorp, "gi");
      sanitized = sanitized.replace(corpRegex, replacementText);
    }

    // Replace each significant part of the company name
    significantNameParts.forEach((part) => {
      if (part.length > 2) {
        // Only replace parts with more than 2 characters
        // Use word boundaries for latin characters
        const wordBoundary = /^[a-zA-Z0-9]/.test(part) ? "\\b" : "";
        const partRegex = new RegExp(
          `${wordBoundary}${part}${wordBoundary}`,
          "gi"
        );
        sanitized = sanitized.replace(partRegex, replacementText);
      }
    });

    return sanitized;
  };

  // Animation states and classes
  const cardClasses = `w-full transition-all duration-500 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:shadow-xl hover:shadow-blue-500/10 ${
    isRevealing ? "shadow-lg" : ""
  } ${wasAnonymous && feedback ? "revealed-card" : ""}`;

  const revealOverlayClasses = `absolute inset-0 z-10 flex items-center justify-center bg-primary/10 backdrop-blur-sm transition-opacity duration-700 ${
    isRevealing ? "opacity-100" : "opacity-0 pointer-events-none"
  }`;

  // Determine icon for feedback type
  const getFeedbackIcon = () => {
    if (!feedback) return null;
    return feedback === "interested" ? (
      <PartyPopper className="text-green-500 animate-bounce" size={24} />
    ) : (
      <ThumbsDown className="text-red-500" size={24} />
    );
  };

  // Generate the confetti elements
  const renderConfetti = () => {
    if (!confetti) return null;

    return (
      <div className="confetti-container">
        {Array.from({length: 50}).map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Confetti celebration */}
      {renderConfetti()}

      {/* Reveal animation overlay */}
      {wasAnonymous && (
        <div className={revealOverlayClasses}>
          <div className="p-6 text-center rounded-lg shadow-lg bg-background/80">
            <div className="mb-2 text-2xl font-bold text-white reveal-text">
              {company.name}
            </div>
            <p className="text-sm text-white opacity-80 reveal-text-delay">
              {t(
                feedback === "interested"
                  ? "recommendations.feedback.companyRevealed.interested"
                  : "recommendations.feedback.companyRevealed.notInterested"
              )}
            </p>
          </div>
        </div>
      )}

      <Card className={cardClasses}>
        <CardHeader className="flex flex-row items-center gap-2 sm:gap-4 p-3 sm:p-6">
          {!shouldAnonymize ? (
            <Link href={company.site_url || "/"} target="_blank">
              <Avatar
                className={`h-10 w-10 sm:h-14 sm:w-14 ring-1 ring-white ${
                  wasAnonymous && feedback ? "reveal-avatar" : ""
                }`}
              >
                {company.logo_url && !logoError ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AvatarImage
                          src={company.logo_url}
                          alt={company.name}
                          onError={() => setLogoError(true)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("recommendations.visitWebsite")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
                <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="relative h-14 w-14">
              <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                <EyeOff size={20} className="opacity-70" />
              </div>
            </Avatar>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium text-white ${
                  wasAnonymous && feedback ? "reveal-text" : ""
                }`}
              >
                {shouldAnonymize ? getAnonymousName() : company.name}
              </span>

              {!shouldAnonymize && company.site_url && (
                <a
                  href={
                    company.site_url.startsWith("http")
                      ? company.site_url
                      : `https://${company.site_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-primary"
                  aria-label={`Visit ${company.name} website`}
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

            <span
              className={`text-xs text-white/70 ${
                wasAnonymous && feedback ? "reveal-text-delay" : ""
              }`}
            >
              {shouldAnonymize
                ? t("recommendations.anonymized")
                : company.industry}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6">
          <div className="mb-3 sm:mb-4">
            <h3 className="mb-1 sm:mb-2 text-sm font-medium text-white">
              {t("recommendations.about")}
            </h3>
            <p
              className={`text-xs sm:text-sm text-white/80 ${
                wasAnonymous && feedback ? "reveal-text-delay" : ""
              }`}
            >
              {shouldAnonymize
                ? getSanitizedDescription(company.description, company.name)
                : company.description}
            </p>
          </div>
          <div>
            <h3 className="mb-1 sm:mb-2 text-sm font-medium text-white">
              {t("recommendations.whyMatch")}
            </h3>
            <ul className="pl-4 sm:pl-5 text-xs sm:text-sm list-disc text-white/80">
              {matchingPoints && matchingPoints.length > 0 ? (
                matchingPoints.map((point, index) => (
                  <li
                    key={index}
                    className={
                      wasAnonymous && feedback
                        ? `reveal-text-delay-${(index % 3) + 2}`
                        : ""
                    }
                  >
                    {shouldAnonymize
                      ? getSanitizedDescription(point, company.name)
                      : point}
                  </li>
                ))
              ) : (
                <li>{t("recommendations.noMatchingPoints")}</li>
              )}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-4">
          {feedback ? (
            <div className="flex items-center justify-center w-full gap-2 text-sm text-white">
              {getFeedbackIcon()}
              <span>
                {feedback === "interested"
                  ? t("recommendations.feedback.markedInterested")
                  : t("recommendations.feedback.markedNotInterested")}
              </span>
            </div>
          ) : (
            <>
              {/* <Button
                variant="outline"
                onClick={() => handleFeedback("not_interested")}
                className=" text-white/90 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105 active:scale-95 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10"
              >
                <ThumbsDown className="w-4 h-4 mr-2 text-red-500" />
                {t("recommendations.feedback.notInterested")}
              </Button> */}

              <Button
                onClick={() => handleFeedback("interested")}
                className="w-full transition-all sm:w-fit bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 active:scale-95"
              >
                <PartyPopper className="w-4 h-4 mr-2 text-white" />
                {t("recommendations.feedback.interested")}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
