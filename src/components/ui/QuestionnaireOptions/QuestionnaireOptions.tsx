"use client";

import Link from "next/link";
import StarBorder from "@/components/ui/Animations/StarBorder/StarBorder";
import {trackSurveyStartClick, trackSurveyTypeSelection} from "@/lib/analytics";

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
      className={`px-4 mt-4 space-y-4 sm:space-y-6 sm:mt-6 md:mt-10 ${className}`}
    >
      <div className="flex justify-center w-full sm:w-auto">
        <Link
          href={`/${lng}/questionnaire?type=text`}
          onClick={() => handleSurveyStart("text")}
        >
          <StarBorder
            as="div"
            color="#3B82F6"
            className="transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            <span className="flex items-center justify-center gap-2">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              {lng === "ja" ? "始める" : "Start"}
            </span>
          </StarBorder>
        </Link>
      </div>
    </div>
  );

  return content;
}
