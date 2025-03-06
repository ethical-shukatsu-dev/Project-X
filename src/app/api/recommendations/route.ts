import {NextResponse} from "next/server";
import {supabase} from "@/lib/supabase/client";
import {generateRecommendations} from "@/lib/openai/client";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const forceRefresh = url.searchParams.get("refresh") === "true";

    if (!userId) {
      return NextResponse.json({error: "User ID is required"}, {status: 400});
    }

    // Get user values from Supabase
    const {data: userData, error: userError} = await supabase
      .from("user_values")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user values:", userError);
      return NextResponse.json({error: "User not found"}, {status: 404});
    }

    // Check if we already have recommendations for this user
    if (!forceRefresh) {
      const {data: existingRecommendations, error: recError} = await supabase
        .from("recommendations")
        .select("*")
        .eq("user_id", userId);

      if (
        !recError &&
        existingRecommendations &&
        existingRecommendations.length > 0
      ) {
        // Return existing recommendations
        const recommendationsWithCompanies = await Promise.all(
          existingRecommendations.map(async (rec) => {
            const {data: company} = await supabase
              .from("companies")
              .select("*")
              .eq("id", rec.company_id)
              .single();

            return {
              ...rec,
              company,
            };
          })
        );

        return NextResponse.json({
          recommendations: recommendationsWithCompanies,
        });
      }
    }

    // Generate new recommendations with real company data
    const recommendations = await generateRecommendations(userData);

    // Save recommendations to Supabase
    const recommendationsToInsert = recommendations.map((rec) => ({
      user_id: userId,
      company_id: rec.company.id,
      matching_points: rec.matchingPoints,
      score: rec.score,
    }));

    const {error: insertError} = await supabase
      .from("recommendations")
      .insert(recommendationsToInsert);

    if (insertError) {
      console.error("Error saving recommendations:", insertError);
      // Continue anyway to return recommendations to the user
    }

    return NextResponse.json({recommendations});
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
