"use client";

import React, {useState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {UserValues, ValueImage} from "@/lib/supabase/client";
import {useTranslation} from "@/i18n-client";
import {ImageQuestionGrid} from "./ImageValueSelector";
import {
  trackSurveyStepCompleted,
  trackSurveyCompleted,
  trackSurveyStepAbandoned,
} from "@/lib/analytics";
import {createUrlWithParams} from "@/lib/utils";

// A/B Testing Toggle - This will be overridden by the questionnaireType prop if provided
const DEFAULT_QUESTIONNAIRE_TYPE = "text"; // "text" or "image"

// Define the questions for the questionnaire
const QUESTIONS = [
  // Values Questions (1-5)
  {
    id: "work_values",
    questionKey: "questionnaire.questions.work_values.question",
    type: "value",
    options: [
      {
        value: "growth",
        labelKey: "questionnaire.questions.work_values.options.growth",
      },
      {
        value: "contribution",
        labelKey: "questionnaire.questions.work_values.options.contribution",
      },
      {
        value: "challenge",
        labelKey: "questionnaire.questions.work_values.options.challenge",
      },
      {
        value: "result_oriented",
        labelKey: "questionnaire.questions.work_values.options.result_oriented",
      },
    ],
  },
  {
    id: "corporate_culture",
    questionKey: "questionnaire.questions.corporate_culture.question",
    type: "value",
    options: [
      {
        value: "innovation",
        labelKey:
          "questionnaire.questions.corporate_culture.options.innovation",
      },
      {
        value: "collaboration",
        labelKey:
          "questionnaire.questions.corporate_culture.options.collaboration",
      },
      {
        value: "diversity",
        labelKey: "questionnaire.questions.corporate_culture.options.diversity",
      },
      {
        value: "customer_orientation",
        labelKey:
          "questionnaire.questions.corporate_culture.options.customer_orientation",
      },
    ],
  },
  {
    id: "leadership",
    questionKey: "questionnaire.questions.leadership.question",
    type: "value",
    options: [
      {
        value: "vision",
        labelKey: "questionnaire.questions.leadership.options.vision",
      },
      {
        value: "influence",
        labelKey: "questionnaire.questions.leadership.options.influence",
      },
      {
        value: "inclusive",
        labelKey: "questionnaire.questions.leadership.options.inclusive",
      },
      {
        value: "decision_making",
        labelKey: "questionnaire.questions.leadership.options.decision_making",
      },
    ],
  },
  {
    id: "workplace_environment",
    questionKey: "questionnaire.questions.workplace_environment.question",
    type: "value",
    options: [
      {
        value: "workability",
        labelKey:
          "questionnaire.questions.workplace_environment.options.workability",
      },
      {
        value: "growth_opportunities",
        labelKey:
          "questionnaire.questions.workplace_environment.options.growth_opportunities",
      },
      {
        value: "sense_of_security",
        labelKey:
          "questionnaire.questions.workplace_environment.options.sense_of_security",
      },
      {
        value: "mutual_support",
        labelKey:
          "questionnaire.questions.workplace_environment.options.mutual_support",
      },
    ],
  },
  {
    id: "humanity",
    questionKey: "questionnaire.questions.humanity.question",
    type: "value",
    options: [
      {
        value: "integrity",
        labelKey: "questionnaire.questions.humanity.options.integrity",
      },
      {
        value: "responsibility",
        labelKey: "questionnaire.questions.humanity.options.responsibility",
      },
      {
        value: "ethics",
        labelKey: "questionnaire.questions.humanity.options.ethics",
      },
      {
        value: "fairness",
        labelKey: "questionnaire.questions.humanity.options.fairness",
      },
    ],
  },

  // Strengths Questions (6-10)
  {
    id: "interpersonal_skills",
    questionKey: "questionnaire.questions.interpersonal_skills.question",
    type: "strength",
    options: [
      {
        value: "cooperation",
        labelKey:
          "questionnaire.questions.interpersonal_skills.options.cooperation",
      },
      {
        value: "empathy",
        labelKey:
          "questionnaire.questions.interpersonal_skills.options.empathy",
      },
      {
        value: "teamwork",
        labelKey:
          "questionnaire.questions.interpersonal_skills.options.teamwork",
      },
      {
        value: "communication",
        labelKey:
          "questionnaire.questions.interpersonal_skills.options.communication",
      },
    ],
  },
  {
    id: "cognitive_abilities",
    questionKey: "questionnaire.questions.cognitive_abilities.question",
    type: "strength",
    options: [
      {
        value: "logical_thinking",
        labelKey:
          "questionnaire.questions.cognitive_abilities.options.logical_thinking",
      },
      {
        value: "problem_solving",
        labelKey:
          "questionnaire.questions.cognitive_abilities.options.problem_solving",
      },
      {
        value: "insight",
        labelKey: "questionnaire.questions.cognitive_abilities.options.insight",
      },
      {
        value: "critical_thinking",
        labelKey:
          "questionnaire.questions.cognitive_abilities.options.critical_thinking",
      },
    ],
  },
  {
    id: "self_growth",
    questionKey: "questionnaire.questions.self_growth.question",
    type: "strength",
    options: [
      {
        value: "change_orientation",
        labelKey:
          "questionnaire.questions.self_growth.options.change_orientation",
      },
      {
        value: "willingness_to_learn",
        labelKey:
          "questionnaire.questions.self_growth.options.willingness_to_learn",
      },
      {
        value: "curiosity",
        labelKey: "questionnaire.questions.self_growth.options.curiosity",
      },
      {
        value: "adaptability",
        labelKey: "questionnaire.questions.self_growth.options.adaptability",
      },
    ],
  },
  {
    id: "job_performance",
    questionKey: "questionnaire.questions.job_performance.question",
    type: "strength",
    options: [
      {
        value: "persistence",
        labelKey: "questionnaire.questions.job_performance.options.persistence",
      },
      {
        value: "time_management",
        labelKey:
          "questionnaire.questions.job_performance.options.time_management",
      },
      {
        value: "efficiency",
        labelKey: "questionnaire.questions.job_performance.options.efficiency",
      },
      {
        value: "planning",
        labelKey: "questionnaire.questions.job_performance.options.planning",
      },
    ],
  },
  {
    id: "mental_strength",
    questionKey: "questionnaire.questions.mental_strength.question",
    type: "strength",
    options: [
      {
        value: "resilience",
        labelKey: "questionnaire.questions.mental_strength.options.resilience",
      },
      {
        value: "open_mindedness",
        labelKey:
          "questionnaire.questions.mental_strength.options.open_mindedness",
      },
      {
        value: "stress_tolerance",
        labelKey:
          "questionnaire.questions.mental_strength.options.stress_tolerance",
      },
      {
        value: "flexibility",
        labelKey: "questionnaire.questions.mental_strength.options.flexibility",
      },
    ],
  },
];

// Define all available image-based questions - these now match the text questions above
const ALL_IMAGE_QUESTIONS = [
  {
    id: "visual_work_values",
    category: "work_values",
    questionKey: "questionnaire.image_questions.work_values.question",
  },
  {
    id: "visual_corporate_culture",
    category: "corporate_culture",
    questionKey: "questionnaire.image_questions.corporate_culture.question",
  },
  {
    id: "visual_leadership",
    category: "leadership",
    questionKey: "questionnaire.image_questions.leadership.question",
  },
  {
    id: "visual_workplace_environment",
    category: "workplace_environment",
    questionKey: "questionnaire.image_questions.workplace_environment.question",
  },
  {
    id: "visual_humanity",
    category: "humanity",
    questionKey: "questionnaire.image_questions.humanity.question",
  },
  {
    id: "visual_interpersonal_skills",
    category: "interpersonal_skills",
    questionKey: "questionnaire.image_questions.interpersonal_skills.question",
  },
  {
    id: "visual_cognitive_abilities",
    category: "cognitive_abilities",
    questionKey: "questionnaire.image_questions.cognitive_abilities.question",
  },
  {
    id: "visual_self_growth",
    category: "self_growth",
    questionKey: "questionnaire.image_questions.self_growth.question",
  },
  {
    id: "visual_job_performance",
    category: "job_performance",
    questionKey: "questionnaire.image_questions.job_performance.question",
  },
  {
    id: "visual_mental_strength",
    category: "mental_strength",
    questionKey: "questionnaire.image_questions.mental_strength.question",
  },
];

// For type compatibility with ValueImage interface
type HardCodedImageData = Record<
  string,
  Array<
    Omit<
      ValueImage,
      | "created_at"
      | "description"
      | "tags"
      | "unsplash_id"
      | "pexels_id"
      | "attribution"
      | "image_sizes"
    >
  >
>;

// Hard-coded image data from the provided table
const HARD_CODED_IMAGE_DATA: HardCodedImageData = {
  work_values: [
    {
      id: "wv_image_1",
      category: "work_values",
      value_name: "growth",
      image_url: "https://images.unsplash.com/photo-1458014854819-1a40aa70211c",
    },
    {
      id: "wv_image_2",
      category: "work_values",
      value_name: "contribution",
      image_url:
        "https://images.pexels.com/photos/6995221/pexels-photo-6995221.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "wv_image_3",
      category: "work_values",
      value_name: "challenge",
      image_url:
        "https://images.pexels.com/photos/461593/pexels-photo-461593.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "wv_image_4",
      category: "work_values",
      value_name: "result_oriented",
      image_url:
        "https://images.pexels.com/photos/7172988/pexels-photo-7172988.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  corporate_culture: [
    {
      id: "cc_image_1",
      category: "corporate_culture",
      value_name: "innovation",
      image_url:
        "https://images.pexels.com/photos/1314410/pexels-photo-1314410.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "cc_image_2",
      category: "corporate_culture",
      value_name: "collaboration",
      image_url:
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "cc_image_3",
      category: "corporate_culture",
      value_name: "diversity",
      image_url:
        "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "cc_image_4",
      category: "corporate_culture",
      value_name: "customer_orientation",
      image_url:
        "https://images.pexels.com/photos/3796810/pexels-photo-3796810.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  leadership: [
    {
      id: "l_image_1",
      category: "leadership",
      value_name: "vision",
      image_url:
        "https://images.pexels.com/photos/3970550/pexels-photo-3970550.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "l_image_2",
      category: "leadership",
      value_name: "influence",
      image_url:
        "https://images.pexels.com/photos/8924332/pexels-photo-8924332.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "l_image_3",
      category: "leadership",
      value_name: "inclusive",
      image_url:
        "https://images.pexels.com/photos/6148991/pexels-photo-6148991.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "l_image_4",
      category: "leadership",
      value_name: "decision_making",
      image_url:
        "https://images.pexels.com/photos/8171207/pexels-photo-8171207.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  workplace_environment: [
    {
      id: "we_image_1",
      category: "workplace_environment",
      value_name: "workability",
      image_url:
        "https://images.pexels.com/photos/6893799/pexels-photo-6893799.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "we_image_2",
      category: "workplace_environment",
      value_name: "growth_opportunities",
      image_url:
        "https://images.pexels.com/photos/8266819/pexels-photo-8266819.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "we_image_3",
      category: "workplace_environment",
      value_name: "sense_of_security",
      image_url:
        "https://images.pexels.com/photos/6457579/pexels-photo-6457579.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "we_image_4",
      category: "workplace_environment",
      value_name: "mutual_support",
      image_url:
        "https://images.pexels.com/photos/7625036/pexels-photo-7625036.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  humanity: [
    {
      id: "h_image_1",
      category: "humanity",
      value_name: "integrity",
      image_url:
        "https://images.pexels.com/photos/6170565/pexels-photo-6170565.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "h_image_2",
      category: "humanity",
      value_name: "responsibility",
      image_url:
        "https://images.pexels.com/photos/8942484/pexels-photo-8942484.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "h_image_3",
      category: "humanity",
      value_name: "ethics",
      image_url:
        "https://images.pexels.com/photos/8112201/pexels-photo-8112201.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "h_image_4",
      category: "humanity",
      value_name: "fairness",
      image_url:
        "https://images.pexels.com/photos/9488837/pexels-photo-9488837.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  interpersonal_skills: [
    {
      id: "is_image_1",
      category: "interpersonal_skills",
      value_name: "cooperation",
      image_url:
        "https://images.pexels.com/photos/3228692/pexels-photo-3228692.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "is_image_2",
      category: "interpersonal_skills",
      value_name: "empathy",
      image_url:
        "https://images.pexels.com/photos/8550841/pexels-photo-8550841.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "is_image_3",
      category: "interpersonal_skills",
      value_name: "teamwork",
      image_url:
        "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg",
    },
    {
      id: "is_image_4",
      category: "interpersonal_skills",
      value_name: "communication",
      image_url:
        "https://images.pexels.com/photos/1181719/pexels-photo-1181719.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  cognitive_abilities: [
    {
      id: "ca_image_1",
      category: "cognitive_abilities",
      value_name: "logical_thinking",
      image_url:
        "https://images.pexels.com/photos/6693283/pexels-photo-6693283.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "ca_image_2",
      category: "cognitive_abilities",
      value_name: "problem_solving",
      image_url:
        "https://images.pexels.com/photos/6147365/pexels-photo-6147365.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "ca_image_3",
      category: "cognitive_abilities",
      value_name: "insight",
      image_url:
        "https://images.pexels.com/photos/336407/pexels-photo-336407.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "ca_image_4",
      category: "cognitive_abilities",
      value_name: "critical_thinking",
      image_url:
        "https://images.pexels.com/photos/6208926/pexels-photo-6208926.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  self_growth: [
    {
      id: "sg_image_1",
      category: "self_growth",
      value_name: "change_orientation",
      image_url:
        "https://images.pexels.com/photos/7679944/pexels-photo-7679944.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "sg_image_2",
      category: "self_growth",
      value_name: "willingness_to_learn",
      image_url:
        "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "sg_image_3",
      category: "self_growth",
      value_name: "curiosity",
      image_url:
        "https://images.pexels.com/photos/3755707/pexels-photo-3755707.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "sg_image_4",
      category: "self_growth",
      value_name: "adaptability",
      image_url:
        "https://images.pexels.com/photos/5231307/pexels-photo-5231307.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  job_performance: [
    {
      id: "jp_image_1",
      category: "job_performance",
      value_name: "persistence",
      image_url:
        "https://images.pexels.com/photos/7215816/pexels-photo-7215816.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "jp_image_2",
      category: "job_performance",
      value_name: "time_management",
      image_url:
        "https://images.pexels.com/photos/295826/pexels-photo-295826.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "jp_image_3",
      category: "job_performance",
      value_name: "efficiency",
      image_url:
        "https://images.pexels.com/photos/31198911/pexels-photo-31198911.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "jp_image_4",
      category: "job_performance",
      value_name: "planning",
      image_url:
        "https://images.pexels.com/photos/796603/pexels-photo-796603.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
  mental_strength: [
    {
      id: "ms_image_1",
      category: "mental_strength",
      value_name: "resilience",
      image_url:
        "https://images.pexels.com/photos/1028930/pexels-photo-1028930.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "ms_image_2",
      category: "mental_strength",
      value_name: "open_mindedness",
      image_url:
        "https://images.pexels.com/photos/235990/pexels-photo-235990.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "ms_image_3",
      category: "mental_strength",
      value_name: "stress_tolerance",
      image_url:
        "https://images.pexels.com/photos/2080544/pexels-photo-2080544.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
    {
      id: "ms_image_4",
      category: "mental_strength",
      value_name: "flexibility",
      image_url:
        "https://images.pexels.com/photos/6046217/pexels-photo-6046217.jpeg?auto=compress&cs=tinysrgb&h=350",
    },
  ],
};

interface ValuesQuestionnaireProps {
  lng: string;
  questionnaireType?: string; // New prop to control which type of questionnaire to show
}

// The hook to track step timing and abandonment
function useStepTracking(totalSteps: number) {
  const startTimeRef = useRef<number>(Date.now());
  const currentStepRef = useRef<number>(0);
  const currentStepIdRef = useRef<string>("");
  // Add a ref to track if the current step has an answer selected
  const hasAnswerSelectedRef = useRef<boolean>(false);

  // Track when the step changes
  const trackStepChange = (newStepIndex: number, stepId: string) => {
    const previousStepIndex = currentStepRef.current;
    const previousStepId = currentStepIdRef.current;

    // If moving to a new step, record the previous step as completed
    if (previousStepId && previousStepIndex !== newStepIndex) {
      // Track the step completion async (fire and forget)
      trackSurveyStepCompleted(
        previousStepIndex,
        previousStepId,
        totalSteps
      ).catch((err) => console.error("Error tracking step completion:", err));

      // Reset start time for the new step
      startTimeRef.current = Date.now();
      // Reset answer selected state for the new step
      hasAnswerSelectedRef.current = false;
    }

    // Update current step refs - IMPORTANT: Update these AFTER tracking completion
    // to ensure we're recording the correct step completion
    currentStepRef.current = newStepIndex;
    currentStepIdRef.current = stepId;
  };

  // Set answer selected state
  const setAnswerSelected = (selected: boolean) => {
    hasAnswerSelectedRef.current = selected;
  };

  // Initialize the first step without tracking completion
  const initializeFirstStep = (stepId: string) => {
    console.log(`Initializing first step: ${stepId}`);
    currentStepRef.current = 0;
    currentStepIdRef.current = stepId;
    startTimeRef.current = Date.now();
    hasAnswerSelectedRef.current = false;
  };

  // Track step abandonment
  useEffect(() => {
    let isFirstRender = true;
    
    // After first render, set isFirstRender to false
    setTimeout(() => {
      isFirstRender = false;
    }, 500);

    // Define the beforeunload handler
    const handleBeforeUnload = () => {
      if (currentStepIdRef.current && !isFirstRender) {
        const timeSpent = Math.round(
          (Date.now() - startTimeRef.current) / 1000
        );

        // Track abandonment regardless of answer status
        console.log(`Abandoning step: ${currentStepIdRef.current} (index: ${currentStepRef.current})`);
        
        // Use navigator.sendBeacon for reliable event sending during page unload
        if (navigator.sendBeacon) {
          const blob = new Blob(
            [
              JSON.stringify({
                event_type: "survey_step_abandoned",
                properties: {
                  stepIndex: currentStepRef.current,
                  stepId: currentStepIdRef.current,
                  totalSteps,
                  timeSpentSeconds: timeSpent,
                  reason: "page_exit"
                },
                timestamp: Date.now(),
              }),
            ],
            {type: "application/json"}
          );

          navigator.sendBeacon("/api/analytics/track", blob);
        } else {
          // Fallback to traditional tracking for older browsers
          trackSurveyStepAbandoned(
            currentStepRef.current,
            currentStepIdRef.current, 
            totalSteps,
            timeSpent,
            "page_exit"
          ).catch(err => 
            console.error("Error tracking step abandonment during unload:", err)
          );
        }
      }
    };

    // Set up visibility change listener (for mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && currentStepIdRef.current && !isFirstRender) {
        const timeSpent = Math.round(
          (Date.now() - startTimeRef.current) / 1000
        );

        // Track abandonment regardless of answer status
        console.log(`Abandoning step (visibility): ${currentStepIdRef.current} (index: ${currentStepRef.current})`);
        
        // For visibility change, we can use the regular tracking method
        trackSurveyStepAbandoned(
          currentStepRef.current,
          currentStepIdRef.current,
          totalSteps,
          timeSpent,
          "visibility_change"
        ).catch(err =>
          console.error("Error tracking step abandonment on visibility change:", err)
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Track abandonment on component unmount regardless of answer status
      // But don't track if it's the first render and we're on first step
      if (currentStepIdRef.current && !isFirstRender) {
        const timeSpent = Math.round(
          (Date.now() - startTimeRef.current) / 1000
        );
        
        console.log(`Abandoning step (unmount): ${currentStepIdRef.current} (index: ${currentStepRef.current})`);
        
        // Component unmounting, track abandonment
        trackSurveyStepAbandoned(
          currentStepRef.current,
          currentStepIdRef.current,
          totalSteps,
          timeSpent,
          "component_unmounted"
        ).catch(err =>
          console.error("Error tracking step abandonment on unmount:", err)
        );
      }
    };
  }, [totalSteps]);

  return { 
    trackStepChange, 
    setAnswerSelected,
    initializeFirstStep
  };
}

export default function ValuesQuestionnaire({
  lng,
  questionnaireType = DEFAULT_QUESTIONNAIRE_TYPE,
}: ValuesQuestionnaireProps) {
  const router = useRouter();
  const {t, loaded} = useTranslation(lng, "ai");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageQuestions, setImageQuestions] = useState<
    Record<string, ValueImage[]>
  >({});
  const [selectedImageValues, setSelectedImageValues] = useState<
    Record<string, string>
  >({});
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [surveyStartTime, setSurveyStartTime] = useState<number>(Date.now());
  const firstStepTrackedRef = useRef(false);

  // Store selected random questions
  const [randomQuestions, setRandomQuestions] = useState<typeof QUESTIONS>([]);
  const [randomImageQuestions, setRandomImageQuestions] = useState<
    typeof ALL_IMAGE_QUESTIONS
  >([]);

  // Determine if we should use only image questions based on the prop
  const useOnlyImageQuestions = questionnaireType === "image";

  // Use step tracking hook - define it before the effects so we can use it in them
  const { trackStepChange, setAnswerSelected, initializeFirstStep } = useStepTracking(QUESTIONS.length);

  useEffect(() => {
    // Scroll to top of page
    window.scrollTo({top: 0, behavior: "smooth"});

    // Set survey start time
    setSurveyStartTime(Date.now());

    // Set up the questions
    setRandomQuestions(QUESTIONS);

    // Set up the image questions
    const selectedCategories = QUESTIONS.map((q) => q.id);
    const selectedImageQuestions = ALL_IMAGE_QUESTIONS.filter((q) =>
      selectedCategories.includes(q.category)
    );
    setRandomImageQuestions(selectedImageQuestions);

    // Track the first question on component mount, but only once
    if (QUESTIONS.length > 0 && !firstStepTrackedRef.current) {
      const firstQuestionId =
        useOnlyImageQuestions && ALL_IMAGE_QUESTIONS.length > 0
          ? ALL_IMAGE_QUESTIONS[0].id
          : QUESTIONS[0].id;
      
      // Initialize the first step without tracking completion
      initializeFirstStep(firstQuestionId);
      firstStepTrackedRef.current = true;
    }

    setIsInitialized(true);
  }, [useOnlyImageQuestions]);

  // Calculate total questions based on questionnaire type
  const totalTextQuestions = randomQuestions.length;
  const totalImageQuestions = randomImageQuestions.length;
  const totalQuestions = useOnlyImageQuestions
    ? totalImageQuestions
    : totalTextQuestions;

  // Load the hardcoded image data instead of fetching from the database
  useEffect(() => {
    // Convert hardcoded image data to match ValueImage type
    const processedImageData: Record<string, ValueImage[]> = {};

    // Process each category
    Object.entries(HARD_CODED_IMAGE_DATA).forEach(([category, images]) => {
      processedImageData[category] = images.map((img) => ({
        ...img,
        created_at: new Date().toISOString(), // Add required field with default value
      }));
    });

    setImageQuestions(processedImageData);
    setIsLoadingImages(false);
  }, []);

  const handleImageValueChange = (questionId: string, imageId: string) => {
    setSelectedImageValues((prev) => ({...prev, [questionId]: imageId}));
    // Mark that an answer has been selected
    setAnswerSelected(true);
    // Automatically progress to next question if not on the last question
    if (currentQuestion < totalQuestions - 1) {
      handleNext();
    }
  };

  const handleNext = async () => {
    // Get the next step data that we'll navigate to
    const nextQuestion = currentQuestion + 1;
    const nextQuestionData = nextQuestion < totalQuestions
      ? (useOnlyImageQuestions
          ? randomImageQuestions[nextQuestion]
          : randomQuestions[nextQuestion])
      : null;

    if (currentQuestion === totalQuestions - 1) {
      // If this is the last question, submit the form
      handleSubmit();
    } else if (currentQuestion < totalQuestions) {
      // First update the UI to show the next question
      setCurrentQuestion(nextQuestion);
      
      // Then track step change with the ID of the next question
      // This ensures completion of current step is tracked correctly
      if (nextQuestionData) {
        trackStepChange(nextQuestion, nextQuestionData.id);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      // Get the previous question data before changing state
      const prevQuestion = currentQuestion - 1;
      const previousQuestionData = useOnlyImageQuestions
        ? randomImageQuestions[prevQuestion]
        : randomQuestions[prevQuestion];
      
      // First update the UI to show the previous question
      setCurrentQuestion(prevQuestion);
      
      // Then track step change for the previous step
      trackStepChange(prevQuestion, previousQuestionData.id);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Track survey completion
      const surveyDurationSeconds = Math.floor(
        (Date.now() - surveyStartTime) / 1000
      );
      await trackSurveyCompleted(
        useOnlyImageQuestions ? "image" : "text",
        totalQuestions,
        surveyDurationSeconds
      );

      // Convert values to numeric format for better AI processing
      const numericValues: Record<string, number> = {};
      const numericStrengths: Record<string, number> = {};

      // Only process text-based values if we're in text-only mode
      if (!useOnlyImageQuestions) {
        Object.entries(values).forEach(([questionId, value]) => {
          // Find the question to determine if it's a value or strength
          const question = QUESTIONS.find((q) => q.id === questionId);

          if (question) {
            // Assign a value of 5 (on a scale of 1-5) to indicate strong preference
            if (question.type === "strength") {
              numericStrengths[value] = 5;
            } else {
              numericValues[value] = 5;
            }
          } else {
            // Default to values if type not found
            numericValues[value] = 5;
          }
        });
      }

      // Prepare selected image values - only if we're in image-only mode
      const selectedImages: Record<string, string[]> = {};

      if (useOnlyImageQuestions) {
        Object.entries(selectedImageValues).forEach(([questionId, imageId]) => {
          // Find the corresponding image question from our random selection
          const imageQuestion = randomImageQuestions.find(
            (q) => q.id === questionId
          );
          if (imageQuestion) {
            // Get the category
            const category = imageQuestion.category;

            // Find the image details
            const image = imageQuestions[category]?.find(
              (img) => img.id === imageId
            );

            if (image) {
              // Add the value_name to the selected images
              if (!selectedImages[category]) {
                selectedImages[category] = [];
              }
              selectedImages[category].push(image.value_name);
            }
          }
        });
      }

      // Create user values object - no longer including interests
      const userValues: Partial<UserValues> = {
        values: numericValues,
        selected_image_values: selectedImages,
        questionnaire_type: questionnaireType,
        strengths: numericStrengths,
      };

      // Submit to API
      const response = await fetch("/api/values", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userValues),
      });

      if (!response.ok) {
        throw new Error("Failed to save values");
      }

      const data = await response.json();
      
      // Use the utility function to create URL with preserved params from window.location.search
      const searchParamsObj = new URLSearchParams(window.location.search);
      const url = createUrlWithParams(
        `/${lng}/recommendations`, 
        searchParamsObj,
        {
          exclude: ['userId', 'type'],
          include: {
            userId: data.userId,
          }
        }
      );
      
      // Navigate to recommendations page
      router.push(url);
    } catch (error) {
      console.error("Error submitting values:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleValueChange = (questionId: string, value: string) => {
    setValues((prev) => ({...prev, [questionId]: value}));
    // Mark that an answer has been selected
    setAnswerSelected(true);
    // Automatically progress to next question if not on the last question
    if (currentQuestion < totalQuestions - 1) {
      handleNext();
    }
  };

  // If translations are not loaded yet, show a loading state
  if (!loaded || isLoadingImages || !isInitialized) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 mb-4 border-4 rounded-full border-t-blue-500 border-r-purple-500 border-b-blue-500 border-l-purple-500 border-t-transparent animate-spin" />
          <CardTitle className="text-xl text-gray-300 animate-pulse">
            Loading...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Render the current question
  const renderQuestion = () => {
    // Text-based questions - only shown if useOnlyImageQuestions is false
    if (!useOnlyImageQuestions && currentQuestion < totalTextQuestions) {
      const question = randomQuestions[currentQuestion];
      return (
        <>
          <CardHeader>
            <CardTitle className="text-xl text-gray-300">
              {t("questionnaire.progress", {
                current: currentQuestion + 1,
                total: totalTextQuestions,
              })}
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              {t(question.questionKey)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={values[question.id] || ""}
              onValueChange={(value) => handleValueChange(question.id, value)}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {question.options.map(
                (option: {value: string; labelKey: string}) => (
                  <div
                    key={option.value}
                    className="relative"
                  >
                    <RadioGroupItem
                      id={option.value}
                      value={t(option.labelKey)}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex items-center justify-center w-full p-4 text-base text-gray-300 transition-all duration-300 rounded-lg cursor-pointer border border-white/10 hover:bg-white/5 peer-data-[state=checked]:bg-gradient-to-r peer-data-[state=checked]:from-blue-500/80 peer-data-[state=checked]:to-purple-500/80 peer-data-[state=checked]:border-transparent peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-lg hover:shadow-blue-500/10"
                    >
                      {t(option.labelKey)}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              {t("questionnaire.previous")}
            </Button>
            <Button
              onClick={
                currentQuestion === totalTextQuestions - 1
                  ? handleSubmit
                  : handleNext
              }
              disabled={!values[question.id] || isSubmitting}
              className="text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-500/10"
            >
              {currentQuestion === totalTextQuestions - 1
                ? isSubmitting
                  ? t("questionnaire.submitting")
                  : t("questionnaire.submit")
                : t("questionnaire.next")}
            </Button>
          </CardFooter>
        </>
      );
    }
    // Image-based questions - only shown if useOnlyImageQuestions is true
    else if (useOnlyImageQuestions && currentQuestion < totalImageQuestions) {
      const imageQuestionIndex = currentQuestion;
      const question = randomImageQuestions[imageQuestionIndex];
      // Each category has 4 images in our hardcoded data
      const images = imageQuestions[question.category] || [];

      return (
        <>
          <CardHeader>
            <CardTitle className="text-xl text-gray-300">
              {t("questionnaire.progress", {
                current: currentQuestion + 1,
                total: totalImageQuestions,
              })}
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              {t(question.questionKey)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {images.length > 0 ? (
              <ImageQuestionGrid
                images={images}
                onSelect={(imageId) =>
                  handleImageValueChange(question.id, imageId)
                }
                selectedImageId={selectedImageValues[question.id]}
              />
            ) : (
              <p>{t("questionnaire.no_images")}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              {t("questionnaire.previous")}
            </Button>
            <Button
              onClick={
                currentQuestion === totalImageQuestions - 1
                  ? handleSubmit
                  : handleNext
              }
              disabled={
                (!selectedImageValues[question.id] && images.length > 0) ||
                isSubmitting
              }
              className="text-white transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-500/10"
            >
              {currentQuestion === totalImageQuestions - 1
                ? isSubmitting
                  ? t("questionnaire.submitting")
                  : t("questionnaire.submit")
                : t("questionnaire.next")}
            </Button>
          </CardFooter>
        </>
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
      {renderQuestion()}
    </Card>
  );
}
