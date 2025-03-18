import React, {useState} from "react";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Company} from "@/lib/supabase/client";
import {useTranslation} from "@/i18n-client";
import {ExternalLink, EyeOff} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Link from "next/link";
import { LOCALSTORAGE_KEYS } from "@/lib/constants/localStorage";

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

  // Check if we're in a browser environment before accessing localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES);
      setIsAnonymous(storedValue === 'true');
    }
  }, []);

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
  const getSanitizedDescription = (description: string, companyName: string) => {
    if (!description || !companyName) return description;
    
    // Get the localized replacement text for "this company"
    const replacementText = t("recommendations.thisCompany");
    
    // Create a safe version of the company name to use in a regex
    // Escape special regex characters and handle potential Japanese characters
    const safeCompanyName = companyName
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .trim();
    
    // Split the company name by spaces and common separators to handle partial matches
    const nameParts = safeCompanyName.split(/[\s,\.・株式会社|Inc\.|Corporation|Corp\.|Co\.|Ltd\.]+/);
    
    // Filter out too short name parts (likely to cause false positives)
    const significantNameParts = nameParts.filter(part => part.length > 1);
    
    let sanitized = description;
    
    // Replace the full company name
    const fullNameRegex = new RegExp(safeCompanyName, 'gi');
    sanitized = sanitized.replace(fullNameRegex, replacementText);
    
    // For Japanese company names with 株式会社 (Corporation), also check without it
    if (companyName.includes('株式会社')) {
      const nameWithoutCorp = companyName.replace('株式会社', '').trim();
      const corpRegex = new RegExp(nameWithoutCorp, 'gi');
      sanitized = sanitized.replace(corpRegex, replacementText);
    }
    
    // Replace each significant part of the company name
    significantNameParts.forEach(part => {
      if (part.length > 2) { // Only replace parts with more than 2 characters
        // Use word boundaries for latin characters
        const wordBoundary = /^[a-zA-Z0-9]/.test(part) ? '\\b' : '';
        const partRegex = new RegExp(`${wordBoundary}${part}${wordBoundary}`, 'gi');
        sanitized = sanitized.replace(partRegex, replacementText);
      }
    });
    
    return sanitized;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        {!shouldAnonymize ? (
          <Link href={company.site_url || "/"} target="_blank">
            <Avatar className="h-14 w-14">
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
          <Avatar className="h-14 w-14 relative">
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
              <EyeOff size={20} className="opacity-70" />
            </div>
          </Avatar>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">
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
                className="text-muted-foreground hover:text-primary"
                aria-label={`Visit ${company.name} website`}
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          <span className="text-xs text-muted-foreground">
            {shouldAnonymize ? t("recommendations.anonymized") : company.industry}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            {t("recommendations.about")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {shouldAnonymize 
              ? getSanitizedDescription(company.description, company.name)
              : company.description}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">
            {t("recommendations.whyMatch")}
          </h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {matchingPoints && matchingPoints.length > 0 ? (
              matchingPoints.map((point, index) => (
                <li key={index}>
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
          <div className="w-full text-center text-sm text-muted-foreground">
            {feedback === "interested"
              ? t("recommendations.feedback.markedInterested")
              : t("recommendations.feedback.markedNotInterested")}
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => onFeedback("not_interested")}
            >
              {t("recommendations.feedback.notInterested")}
            </Button>

            <Button onClick={() => onFeedback("interested")}>
              {t("recommendations.feedback.interested")}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
