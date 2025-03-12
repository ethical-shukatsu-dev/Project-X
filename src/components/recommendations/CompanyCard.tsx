import React, {useState} from "react";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Company} from "@/lib/supabase/client";
import {useTranslation} from "@/i18n-client";
import {ExternalLink} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Link from "next/link";

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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
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

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{company.name}</span>

            {company.site_url && (
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
            {company.industry}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            {t("recommendations.about")}
          </h3>
          <p className="text-sm text-muted-foreground">{company.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">
            {t("recommendations.whyMatch")}
          </h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {matchingPoints && matchingPoints.length > 0 ? (
              matchingPoints.map((point, index) => <li key={index}>{point}</li>)
            ) : (
              <li>{t("recommendations.noMatchingPoints")}</li>
            )}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
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
