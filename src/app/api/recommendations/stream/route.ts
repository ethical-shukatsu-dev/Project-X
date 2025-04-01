import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { streamRecommendations } from "@/lib/openai/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const locale = url.searchParams.get("locale") || "en";

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Get user values from Supabase
  const { data: userData, error: userError } = await supabase
    .from("user_values")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching user values:", userError);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Create a new ReadableStream to stream the recommendations
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamRecommendations(
          userData,
          locale as "en" | "ja",
          async (recommendation) => {
            // Log the recommendation being streamed
            console.log("Streaming recommendation:", recommendation.company.name);
            
            // Save recommendation to Supabase
            const { error: insertError } = await supabase
              .from("recommendations")
              .insert({
                user_id: userId,
                company_id: recommendation.company.id,
                matching_points: recommendation.matching_points,
                value_match_ratings: recommendation.value_match_ratings || null,
                strength_match_ratings: recommendation.strength_match_ratings || null,
                value_matching_details: recommendation.value_matching_details || null,
                strength_matching_details: recommendation.strength_matching_details || null,
              });

            if (insertError) {
              console.error("Error saving recommendation:", insertError);
              // Continue anyway to return the recommendation to the user
            }

            try {
              // Stream the recommendation as valid JSON line
              // Note: We're explicitly formatting this to ensure it's valid JSON 
              // with proper escaping of all inner properties
              const data = JSON.stringify({ 
                recommendation: {
                  ...recommendation,
                  // Ensure all nested properties are properly serialized
                  company: {
                    id: recommendation.company.id,
                    name: recommendation.company.name,
                    industry: recommendation.company.industry,
                    description: recommendation.company.description,
                    size: recommendation.company.size,
                    values: recommendation.company.values,
                    logo_url: recommendation.company.logo_url,
                    site_url: recommendation.company.site_url,
                    company_values: recommendation.company.company_values,
                    data_source: recommendation.company.data_source,
                    last_updated: recommendation.company.last_updated
                  }
                }
              }) + "\n";
              
              console.log("Sending to client:", data.substring(0, 100) + "...");
              controller.enqueue(new TextEncoder().encode(data));
            } catch (error) {
              console.error("Error serializing recommendation:", error);
            }
          }
        );

        // Close the stream when all recommendations are sent
        controller.close();
      } catch (error) {
        console.error("Error streaming recommendations:", error);
        controller.error(error);
      }
    }
  });

  // Return the stream with appropriate headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}