import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { generateRecommendations } from '@/lib/openai/client';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    const locale = url.searchParams.get('locale') || 'en';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user values from Supabase
    const { data: userData, error: userError } = await supabase
      .from('user_values')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user values:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if we already have recommendations for this user
    if (!forceRefresh) {
      const { data: existingRecommendations, error: recError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId);

      if (!recError && existingRecommendations && existingRecommendations.length > 0) {
        // Return existing recommendations
        const recommendationsWithCompanies = await Promise.all(
          existingRecommendations.map(async (rec) => {
            const { data: company } = await supabase
              .from('companies')
              .select('*')
              .eq('id', rec.company_id)
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

    // Fetch previously recommended company names to avoid repetition and promote diversity
    // const {data: previouslyRecommendedCompanies, error: prevRecsError} = await supabase
    //   .from("recommendations")
    //   .select("company_id");

    // if (prevRecsError) {
    //   console.error("Error fetching previously recommended companies:", prevRecsError);
    //   // Continue with the process, we'll just have less information about previous recommendations
    // }

    // // Get the actual company names from the IDs
    // const previousCompanyIds = previouslyRecommendedCompanies?.map(rec => rec.company_id) || [];
    // const {data: previousCompanies} = await supabase
    //   .from("companies")
    //   .select("name")
    //   .in("id", previousCompanyIds.length > 0 ? previousCompanyIds : ['no-companies']);

    // // Extract just the company names
    // const previousCompanyNames = previousCompanies?.map(company => company.name) || [];

    // Generate new recommendations with real company data, passing the locale and previously recommended companies
    const recommendations = await generateRecommendations(userData, locale as 'en' | 'ja');

    // Save recommendations to Supabase
    const recommendationsToInsert = recommendations.map((rec) => ({
      user_id: userId,
      company_id: rec.company.id,
      matching_points: rec.matching_points,
      value_match_ratings: rec.value_match_ratings || null,
      strength_match_ratings: rec.strength_match_ratings || null,
      value_matching_details: rec.value_matching_details || null,
      strength_matching_details: rec.strength_matching_details || null,
    }));

    const { data: insertedRecommendations, error: insertError } = await supabase
      .from('recommendations')
      .insert(recommendationsToInsert)
      .select('*');

    if (!insertError) {
      // Continue anyway to return recommendations to the user
      const recommendationsWithCompanies = await Promise.all(
        insertedRecommendations.map(async (rec) => {
          const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', rec.company_id)
            .single();
          return {
            ...rec,
            company,
          };
        })
      );
      return NextResponse.json({ recommendations: recommendationsWithCompanies });
    } else {
      console.error('Error saving recommendations:', insertError);
      return NextResponse.json({ error: 'Failed to save recommendations' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
