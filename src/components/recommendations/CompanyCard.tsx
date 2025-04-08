import React, {useState, useEffect} from "react";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Company} from "@/lib/supabase/client";
import {useTranslation} from "@/i18n-client";
import {EyeOff, PartyPopper, ThumbsDown} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Link from "next/link";
import {LOCALSTORAGE_KEYS} from "@/lib/constants/localStorage";
import {MatchScoreChart} from "../ui/MatchScoreChart";

// Define the structure for match scores
interface MatchScore {
  name: string;
  score: number;
  details: string;
  category: string;
}

interface CompanyCardProps {
  company: Company;
  matchingPoints: string[];
  valueMatchRatings?: Record<string, number>;
  strengthMatchRatings?: Record<string, number>;
  valueMatchingDetails?: Record<string, string>;
  strengthMatchingDetails?: Record<string, string>;
  onFeedback: (feedback: "interested" | "not_interested") => void;
  feedback?: "interested" | "not_interested";
  lng: string;
}

export default function CompanyCard({
  company,
  matchingPoints,
  valueMatchRatings = {},
  strengthMatchRatings = {},
  valueMatchingDetails = {},
  strengthMatchingDetails = {},
  onFeedback,
  feedback,
  lng,
}: CompanyCardProps) {
  const {t, loaded} = useTranslation(lng, "ai");
  const [logoError, setLogoError] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [wasAnonymous, setWasAnonymous] = useState<boolean>(false);

  // Generate match scores from actual match ratings data
  const generateMatchScores = (): MatchScore[] => {
    const matchScores: MatchScore[] = [];

    // Process value match ratings
    if (Object.keys(valueMatchRatings).length > 0) {
      // Convert to array of objects and sort by score (highest first)
      const valueScores = Object.entries(valueMatchRatings).map(
        ([name, score]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
          score: score * 10, // Convert 1-10 scale to percentage (0-100)
          details: valueMatchingDetails[name] || "",
          category: "Values",
        })
      );

      // Take top value scores for the chart (limit to top 3)
      matchScores.push(
        ...valueScores.sort((a, b) => b.score - a.score).slice(0, 3)
      );
    }

    // Process strength match ratings
    if (Object.keys(strengthMatchRatings).length > 0) {
      // Convert to array of objects and sort by score (highest first)
      const strengthScores = Object.entries(strengthMatchRatings).map(
        ([name, score]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
          score: score * 10, // Convert 1-10 scale to percentage (0-100)
          details: strengthMatchingDetails[name] || "",
          category: "Strengths",
        })
      );

      // Take top strength scores for the chart (limit to top 2)
      matchScores.push(
        ...strengthScores.sort((a, b) => b.score - a.score).slice(0, 2)
      );
    }

    // If we still don't have enough points (at least 3), extract from matching points
    if (matchScores.length < 3 && matchingPoints.length > 0) {
      // Create a fallback map to track categories found in matching points
      const categoryMap: Record<
        string,
        {count: number; matchPoints: string[]}
      > = {};

      // Process matching points to extract key categories
      matchingPoints.forEach((point) => {
        // Try to extract category
        let category = "Other";

        // Look for common categories in the matching point text
        const categoryKeywords = [
          {term: "culture", category: "Culture"},
          {term: "value", category: "Values"},
          {term: "skill", category: "Skills"},
          {term: "experience", category: "Experience"},
          {term: "environment", category: "Environment"},
          {term: "work-life", category: "Work-Life Balance"},
          {term: "leadership", category: "Leadership"},
          {term: "innovation", category: "Innovation"},
          {term: "growth", category: "Growth"},
        ];

        for (const keyword of categoryKeywords) {
          if (point.toLowerCase().includes(keyword.term)) {
            category = keyword.category;
            break;
          }
        }

        // Track the category
        if (!categoryMap[category]) {
          categoryMap[category] = {count: 0, matchPoints: []};
        }

        categoryMap[category].count += 1;
        categoryMap[category].matchPoints.push(point);
      });

      // Convert to scores and add to matchScores
      const additionalScores = Object.entries(categoryMap)
        .filter(
          ([name]) => !matchScores.some((score) => score.name.includes(name))
        ) // Avoid duplicates
        .map(([name, data]) => ({
          name,
          score: 75 + Math.min(data.count * 5, 20), // Base score 75 + up to 20 more based on count
          details: data.matchPoints.join(". "),
          category: "Match Categories",
        }))
        .sort((a, b) => b.score - a.score);

      // Add enough to reach at least 5 total points
      matchScores.push(...additionalScores.slice(0, 5 - matchScores.length));
    }

    // Ensure we have at least 3 categories for the radar chart
    if (matchScores.length < 3) {
      // Use the company values to create fallback categories
      if (company.values) {
        const companyValueScores = Object.entries(company.values)
          .filter(([key]) =>
            [
              "innovation",
              "work_life_balance",
              "diversity_inclusion",
              "career_growth",
            ].includes(key)
          )
          .map(([key, value]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
            score: value * 10, // Convert to percentage
            details: `Company rates ${value}/10 for ${key.replace(/_/g, " ")}`,
            category: "Company Values",
          }))
          .sort((a, b) => b.score - a.score);

        // Add enough to reach at least 5 total points
        matchScores.push(
          ...companyValueScores.slice(0, 5 - matchScores.length)
        );
      }

      // If we still don't have enough, add generic categories
      const defaultCategories = [
        "Culture Fit",
        "Skills Match",
        "Value Alignment",
        "Growth Potential",
        "Work Environment",
      ];
      let i = 0;
      while (matchScores.length < 5 && i < defaultCategories.length) {
        if (!matchScores.some((score) => score.name === defaultCategories[i])) {
          matchScores.push({
            name: defaultCategories[i],
            score: 70 + Math.floor(Math.random() * 15),
            details: "Based on overall company profile",
            category: "General Fit",
          });
        }
        i++;
      }
    }

    // Limit to 5 categories for the pentagon chart
    return matchScores.slice(0, 5);
  };

  const matchScores = generateMatchScores();

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

      // Reset the revealing animation state after animation completes
      const timer = setTimeout(() => {
        setIsRevealing(false);
      }, 2800); // Match this with the CSS animation duration

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
    // Remove Japanese corporation designator "株式会社" before getting initials
    const cleanName = name.replace(/株式会社/g, "").trim();

    // If the name is empty after removing "株式会社", use the original name
    const nameToUse = cleanName || name;

    return nameToUse
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

  const revealOverlayClasses = `fixed inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm transition-opacity duration-700 ${
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

  return (
    <div className="relative">
      {/* Reveal animation overlay */}
      {wasAnonymous && (
        <div className={revealOverlayClasses}>
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-lg shadow-lg bg-background/80">
            {company.logo_url && !logoError ? (
              <Avatar className="mb-2 w-14 h-14 ring-1 ring-white">
                <AvatarImage
                  src={company.logo_url}
                  onError={() => setLogoError(true)}
                />
                <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
              </Avatar>
            ) : null}

            <div className="mb-2 text-2xl font-bold text-black/80 reveal-text">
              {company.name}
            </div>

            <p className="text-sm text-muted-foreground reveal-text-delay">
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
        <CardHeader className="flex flex-row items-center gap-2 px-3 sm:gap-4 ">
          {!shouldAnonymize ? (
            <Avatar
              className={`h-10 w-10 sm:h-14 sm:w-14 ring-1 ring-white ${
                wasAnonymous && feedback ? "reveal-avatar" : ""
              }`}
            >
              {company.logo_url && !logoError ? (
                <Link href={company.site_url || "/"} target="_blank">
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
                </Link>
              ) : null}
              <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
            </Avatar>
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

        <CardContent className="px-3 sm:px-6">
          {/* Content now always uses a vertical layout */}
          <div className="flex flex-col gap-4">
            {/* Match Score Visualization - Only show when not anonymized or after feedback */}
            {(!shouldAnonymize || feedback) && (
              <div
                className={`w-full transition-opacity duration-300 ${
                  wasAnonymous && feedback ? "reveal-chart" : ""
                }`}
              >
                <h3 className="mb-1 text-sm font-medium text-white">
                  {t("recommendations.matchScore") || "Match Breakdown"}
                </h3>
                <div className="mt-1 text-xs text-white/60 mb-1">
                  {t("recommendations.hoverForDetails") ||
                    "Hover/tap categories for details"}
                </div>
                <MatchScoreChart
                  matchingScores={matchScores}
                  className="mt-2"
                />
              </div>
            )}

            {/* Company details section */}
            <div className="w-full">
              <div className="mb-3 sm:mb-4">
                <h3 className="mb-1 text-sm font-medium text-white sm:mb-2">
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
                <h3 className="mb-1 text-sm font-medium text-white sm:mb-2">
                  {t("recommendations.whyMatch")}
                </h3>
                <ul className="pl-4 text-xs list-disc sm:pl-5 sm:text-sm text-white/80">
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
            </div>
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
                className="w-full font-bold transition-all sm:w-fit bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105 active:scale-95"
              >
                <PartyPopper className="w-4 h-4 mr-2 text-white" />
                {isAnonymous
                  ? t("recommendations.viewDetails")
                  : t("recommendations.feedback.interested")}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
