"use client";

import React, {useState, useEffect} from "react";
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
import {Checkbox} from "@/components/ui/checkbox";
import {UserValues, ValueImage} from "@/lib/supabase/client";
import {useTranslation} from "@/i18n-client";
import {ImageQuestionGrid} from "./ImageValueSelector";
import {getImageQuestions} from "@/lib/values/client";

// A/B Testing Toggle - This will be overridden by the questionnaireType prop if provided
const DEFAULT_QUESTIONNAIRE_TYPE = "text"; // "text" or "image"

// Number of random image questions to select
const NUM_RANDOM_IMAGE_QUESTIONS = 5;

// Define the questions for the questionnaire
const QUESTIONS = [
  {
    id: "work_environment",
    questionKey: "questionnaire.questions.work_environment.question",
    options: [
      {
        value: "collaborative",
        labelKey:
          "questionnaire.questions.work_environment.options.collaborative",
      },
      {
        value: "autonomous",
        labelKey: "questionnaire.questions.work_environment.options.autonomous",
      },
      {
        value: "structured",
        labelKey: "questionnaire.questions.work_environment.options.structured",
      },
      {
        value: "flexible",
        labelKey: "questionnaire.questions.work_environment.options.flexible",
      },
    ],
  },
  {
    id: "company_culture",
    questionKey: "questionnaire.questions.company_culture.question",
    options: [
      {
        value: "innovation",
        labelKey: "questionnaire.questions.company_culture.options.innovation",
      },
      {
        value: "work_life_balance",
        labelKey:
          "questionnaire.questions.company_culture.options.work_life_balance",
      },
      {
        value: "growth",
        labelKey: "questionnaire.questions.company_culture.options.growth",
      },
      {
        value: "social_impact",
        labelKey:
          "questionnaire.questions.company_culture.options.social_impact",
      },
    ],
  },
  {
    id: "leadership_style",
    questionKey: "questionnaire.questions.leadership_style.question",
    options: [
      {
        value: "mentorship",
        labelKey: "questionnaire.questions.leadership_style.options.mentorship",
      },
      {
        value: "empowerment",
        labelKey:
          "questionnaire.questions.leadership_style.options.empowerment",
      },
      {
        value: "transparent",
        labelKey:
          "questionnaire.questions.leadership_style.options.transparent",
      },
      {
        value: "results_oriented",
        labelKey:
          "questionnaire.questions.leadership_style.options.results_oriented",
      },
    ],
  },
  {
    id: "work_priorities",
    questionKey: "questionnaire.questions.work_priorities.question",
    options: [
      {
        value: "compensation",
        labelKey:
          "questionnaire.questions.work_priorities.options.compensation",
      },
      {
        value: "learning",
        labelKey: "questionnaire.questions.work_priorities.options.learning",
      },
      {
        value: "impact",
        labelKey: "questionnaire.questions.work_priorities.options.impact",
      },
      {
        value: "stability",
        labelKey: "questionnaire.questions.work_priorities.options.stability",
      },
    ],
  },
];

// Define all available image-based questions
const ALL_IMAGE_QUESTIONS = [
  {
    id: "visual_hobbies",
    category: "hobbies",
    questionKey: "questionnaire.image_questions.hobbies.question",
  },
  {
    id: "visual_work_values",
    category: "work_values",
    questionKey: "questionnaire.image_questions.work_values.question",
  },
  {
    id: "visual_leadership_values",
    category: "leadership_values",
    questionKey: "questionnaire.image_questions.leadership_values.question",
  },
  {
    id: "visual_company_culture",
    category: "company_culture",
    questionKey: "questionnaire.image_questions.company_culture.question",
  },
  {
    id: "visual_work_environment",
    category: "work_environment",
    questionKey: "questionnaire.image_questions.work_environment.question",
  },
  {
    id: "visual_innovation",
    category: "innovation",
    questionKey: "questionnaire.image_questions.innovation.question",
  },
  {
    id: "visual_personal_professional_growth",
    category: "personal_professional_growth",
    questionKey:
      "questionnaire.image_questions.personal_professional_growth.question",
  },
  {
    id: "visual_work_life_balance",
    category: "work_life_balance",
    questionKey: "questionnaire.image_questions.work_life_balance.question",
  },
  {
    id: "visual_financial_job_security",
    category: "financial_job_security",
    questionKey:
      "questionnaire.image_questions.financial_job_security.question",
  },
  {
    id: "visual_impact_purpose",
    category: "impact_purpose",
    questionKey: "questionnaire.image_questions.impact_purpose.question",
  },
  {
    id: "visual_communication_transparency",
    category: "communication_transparency",
    questionKey:
      "questionnaire.image_questions.communication_transparency.question",
  },
  {
    id: "visual_recognition_appreciation",
    category: "recognition_appreciation",
    questionKey:
      "questionnaire.image_questions.recognition_appreciation.question",
  },
];

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface ValuesQuestionnaireProps {
  lng: string;
  questionnaireType?: string; // New prop to control which type of questionnaire to show
}

export default function ValuesQuestionnaire({lng, questionnaireType = DEFAULT_QUESTIONNAIRE_TYPE}: ValuesQuestionnaireProps) {
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
  
  // Determine if we should use only image questions based on the prop
  const useOnlyImageQuestions = questionnaireType === "image";
  
  // Randomly select a subset of image questions on component mount
  const [randomImageQuestions, setRandomImageQuestions] = useState<typeof ALL_IMAGE_QUESTIONS>([]);
  
  useEffect(() => {
    // Randomly select NUM_RANDOM_IMAGE_QUESTIONS from ALL_IMAGE_QUESTIONS
    const randomQuestions = shuffleArray(ALL_IMAGE_QUESTIONS).slice(0, NUM_RANDOM_IMAGE_QUESTIONS);
    setRandomImageQuestions(randomQuestions);
    setIsInitialized(true);
  }, []);

  // Calculate total questions based on questionnaire type
  const totalTextQuestions = QUESTIONS.length;
  const totalImageQuestions = randomImageQuestions.length;
  const totalQuestions = useOnlyImageQuestions ? totalImageQuestions : totalTextQuestions;

  // Fetch image questions on component mount
  useEffect(() => {
    const fetchImageQuestions = async () => {
      try {
        const images = await getImageQuestions();
        setImageQuestions(images);
      } catch (error) {
        console.error("Error fetching image questions:", error);
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImageQuestions();
  }, []);

  const handleImageValueChange = (questionId: string, imageId: string) => {
    setSelectedImageValues((prev) => ({...prev, [questionId]: imageId}));
  };

  const handleNext = () => {
    // If we're at the last question, submit automatically instead of showing interests
    if (currentQuestion === totalQuestions - 1) {
      handleSubmit();
    } else if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert values to numeric format for better AI processing
      const numericValues: Record<string, number> = {};
      
      // Only process text-based values if we're in text-only mode
      if (!useOnlyImageQuestions) {
        Object.values(values).forEach((value) => {
          // Assign a value of 5 (on a scale of 1-5) to indicate strong preference
          numericValues[value] = 5;
        });
      }

      // Prepare selected image values - only if we're in image-only mode
      const selectedImages: Record<string, string[]> = {};
      
      if (useOnlyImageQuestions) {
        Object.entries(selectedImageValues).forEach(([questionId, imageId]) => {
          // Find the corresponding image question from our random selection
          const imageQuestion = randomImageQuestions.find((q) => q.id === questionId);
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
        questionnaire_type: questionnaireType, // Add the questionnaire type to the user values
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

      // Redirect to recommendations page with locale and userId
      router.push(
        `/${lng}/recommendations?userId=${data.userId}&locale=${lng}`
      );
    } catch (error) {
      console.error("Error submitting values:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValueChange = (questionId: string, value: string) => {
    setValues((prev) => ({...prev, [questionId]: value}));
  };

  // If translations are not loaded yet, show a loading state
  if (!loaded || isLoadingImages || !isInitialized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Render the current question
  const renderQuestion = () => {
    // Text-based questions - only shown if useOnlyImageQuestions is false
    if (!useOnlyImageQuestions && currentQuestion < totalTextQuestions) {
      const question = QUESTIONS[currentQuestion];
      return (
        <>
          <CardHeader>
            <CardTitle className="text-xl">
              {t("questionnaire.progress", {
                current: currentQuestion + 1,
                total: totalTextQuestions, // No longer adding +1 for interests
              })}
            </CardTitle>
            <CardDescription className="text-lg">
              {t(question.questionKey)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={values[question.id] || ""}
              onValueChange={(value) => handleValueChange(question.id, value)}
              className="space-y-3"
            >
              {question.options.map((option: { value: string; labelKey: string }) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-base">
                    {t(option.labelKey)}
                  </Label>
                </div>
              ))}
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
              onClick={currentQuestion === totalTextQuestions - 1 ? handleSubmit : handleNext} 
              disabled={!values[question.id] || isSubmitting}
            >
              {currentQuestion === totalTextQuestions - 1 
                ? (isSubmitting ? t("questionnaire.submitting") : t("questionnaire.submit"))
                : t("questionnaire.next")
              }
            </Button>
          </CardFooter>
        </>
      );
    }
    // Image-based questions - only shown if useOnlyImageQuestions is true
    else if (useOnlyImageQuestions && currentQuestion < totalImageQuestions) {
      const imageQuestionIndex = currentQuestion;
      const question = randomImageQuestions[imageQuestionIndex];
      // Each category has 4 random images selected during initial load
      const images = imageQuestions[question.category] || [];

      return (
        <>
          <CardHeader>
            <CardTitle className="text-xl">
              {t("questionnaire.progress", {
                current: currentQuestion + 1,
                total: totalImageQuestions, // No longer adding +1 for interests
              })}
            </CardTitle>
            <CardDescription className="text-lg">
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
              onClick={currentQuestion === totalImageQuestions - 1 ? handleSubmit : handleNext}
              disabled={(!selectedImageValues[question.id] && images.length > 0) || isSubmitting}
            >
              {currentQuestion === totalImageQuestions - 1 
                ? (isSubmitting ? t("questionnaire.submitting") : t("questionnaire.submit"))
                : t("questionnaire.next")
              }
            </Button>
          </CardFooter>
        </>
      );
    }
  };

  return <Card className="w-full max-w-md mx-auto">{renderQuestion()}</Card>;
}
