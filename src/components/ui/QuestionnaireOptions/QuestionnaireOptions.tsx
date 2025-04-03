"use client";

import StarBorder from "@/components/ui/Animations/StarBorder/StarBorder";
import {trackSurveyStartClick, trackSurveyTypeSelection} from "@/lib/analytics";
import { Link } from "@/components/ui/link";

interface QuestionnaireOptionsProps {
  lng: string;
  className?: string;
}

export default function QuestionnaireOptions({
  lng,
  className = "",
}: QuestionnaireOptionsProps) {
  // Handler for tracking survey start click and type selection
  const handleSurveyStart = async (type: "text" | "image") => {
    try {
      await trackSurveyStartClick();
      await trackSurveyTypeSelection(type);
    } catch (error) {
      console.error("Error tracking survey selection:", error);
    }
  };

  const content = (
    <div
      className={`space-y-4 sm:space-y-6  ${className}`}
    >
        <Link
          href={`/${lng}/questionnaire?type=text`}
          onClick={() => handleSurveyStart("text")}
        >
          <StarBorder
            as="div"
            color="#3B82F6"
            className="transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            <span className="flex items-center justify-center gap-2 px-12 font-bold text-black">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {lng === "ja" ? "簡単90秒で診断" : "Begin"}
            </span>
          </StarBorder>
        </Link>
    </div>
  );

  return content;
}
