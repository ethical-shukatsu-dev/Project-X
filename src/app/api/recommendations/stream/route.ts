import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { streamRecommendations, RecommendationResult } from '@/lib/recommendations/client';

export async function GET(request: Request) {
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
      // Return existing recommendations as a stream to maintain consistency
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Fetch and stream each existing recommendation
            for (const rec of existingRecommendations) {
              const { data: company } = await supabase
                .from('companies')
                .select('*')
                .eq('id', rec.company_id)
                .single();

              if (!company) {
                console.error('Company not found for recommendation:', rec.id);
                continue;
              }

              // Create a recommendation object in the same format as streamRecommendations
              const recommendation = {
                id: rec.id,
                company: company,
                matching_points: rec.matching_points,
                value_match_ratings: rec.value_match_ratings,
                strength_match_ratings: rec.strength_match_ratings,
                value_matching_details: rec.value_matching_details,
                strength_matching_details: rec.strength_matching_details,
              };

              try {
                const data =
                  JSON.stringify({
                    recommendation,
                  }) + '\n';

                console.log('Streaming existing recommendation:', recommendation.company.name);
                controller.enqueue(new TextEncoder().encode(data));

                // Add a small delay to prevent overwhelming the client
                await new Promise((resolve) => setTimeout(resolve, 50));
              } catch (error) {
                console.error('Error serializing recommendation:', error);
              }
            }

            // Close the stream when all recommendations are sent
            controller.close();
          } catch (error) {
            console.error('Error streaming existing recommendations:', error);
            controller.error(error);
          }
        },
      });

      // Return the stream with appropriate headers
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  }

  // Store all recommendations to save them after streaming is complete
  const allRecommendations: RecommendationResult[] = [];

  // Create a new ReadableStream to stream the recommendations
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamRecommendations(userData, locale as 'en' | 'ja', async (recommendation) => {
          // Log the recommendation being streamed
          console.log('Streaming recommendation:', recommendation.company.name);

          // Store recommendation for later database insertion
          allRecommendations.push(recommendation);

          try {
            // Stream the recommendation as valid JSON line
            // Note: We're explicitly formatting this to ensure it's valid JSON
            // with proper escaping of all inner properties
            const data =
              JSON.stringify({
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
                    last_updated: recommendation.company.last_updated,
                  },
                },
              }) + '\n';

            console.log('Sending to client:', data.substring(0, 100) + '...');
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error('Error serializing recommendation:', error);
          }
        });

        // After all recommendations are streamed, save them to the database
        if (allRecommendations.length > 0) {
          const recommendationsToInsert = allRecommendations.map((rec) => ({
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

          if (insertError) {
            console.error('Error saving recommendations:', insertError);
          } else {
            console.log(
              `Successfully saved ${insertedRecommendations.length} recommendations to Supabase`
            );
          }
        }

        // Close the stream when all recommendations are sent
        controller.close();
      } catch (error) {
        console.error('Error streaming recommendations:', error);
        controller.error(error);
      }
    },
  });

  // Return the stream with appropriate headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
