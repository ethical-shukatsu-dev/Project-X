"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/i18n-client";
import useABTesting from "@/hooks/useABTesting";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnonymousModeToggleProps {
  lng: string;
}

export default function AnonymousModeToggle({ lng }: AnonymousModeToggleProps) {
  const { t, loaded: translationsLoaded } = useTranslation(lng, "common");
  const { isAnonymous, isLoaded } = useABTesting();
  const [isMounted, setIsMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !translationsLoaded || !isLoaded) {
    return null; // Don't render anything on server or while loading
  }

  return (
    <div className="flex items-center mt-4 space-x-2">
      <Card className="flex flex-row items-center gap-3 p-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="anonymous-mode"
            checked={isAnonymous}
            disabled={true} // Disable manual toggling since it's controlled by A/B testing
          />
          <Label htmlFor="anonymous-mode" className="text-sm cursor-pointer sm:text-base">
            {t("homepage.anonymousMode")}
          </Label>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={16} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t("homepage.anonymousModeDescription")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Card>
    </div>
  );
} 