import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Updates existing companies in the database with domain URLs if they don't have one
 */
async function updateCompanyDomains(batchSize: number = 10): Promise<{ updated: number, failed: number }> {
  try {
    // Get companies without domain URLs
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .is('site_url', null)
      .limit(batchSize);

    if (error) {
      console.error('Error fetching companies without domain URLs:', error);
      return { updated: 0, failed: 0 };
    }

    if (!companies || companies.length === 0) {
      console.log('No companies without domain URLs found');
      return { updated: 0, failed: 0 };
    }

    console.log(`Found ${companies.length} companies without domain URLs. Updating...`);

    let updatedCount = 0;
    let failedCount = 0;

    // Update each company with a domain URL
    for (const company of companies) {
      try {
        // Use OpenAI to get the domain URL
        const response = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that provides accurate information about company websites. Respond with only the domain URL in the format 'domain.com' without any additional text, explanation, or formatting. If you don't know or aren't sure, respond with null."
            },
            {
              role: "user",
              content: `What is the official website domain for ${company.name} (${company.industry})? Respond with only the domain in the format 'domain.com' without any additional text.`
            }
          ]
        });

        const content = response.choices[0].message.content?.trim();
        
        // Check if the response is valid
        let domainUrl = null;
        if (content && content.toLowerCase() !== 'null' && content !== 'unknown' && content !== 'n/a') {
          // Clean up the domain (remove http://, https://, www. if present)
          domainUrl = content.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
          
          // Add https:// prefix for consistency
          if (!domainUrl.startsWith('http')) {
            domainUrl = `https://${domainUrl}`;
          }
        }
        
        // Update the company in the database
        const { error: updateError } = await supabase
          .from('companies')
          .update({ 
            site_url: domainUrl,
            last_updated: new Date().toISOString()
          })
          .eq('id', company.id);
        
        if (updateError) {
          console.error(`Error updating domain URL for company ${company.name}:`, updateError);
          failedCount++;
        } else {
          console.log(`Updated domain URL for company ${company.name} to ${domainUrl}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error processing domain URL for company ${company.name}:`, error);
        failedCount++;
      }
    }

    console.log(`Finished updating company domain URLs. Updated: ${updatedCount}, Failed: ${failedCount}`);
    return { updated: updatedCount, failed: failedCount };
  } catch (error) {
    console.error('Error updating company domain URLs:', error);
    return { updated: 0, failed: 0 };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for a secret key to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.API_SECRET_KEY;
    
    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get batch size from query parameters
    const url = new URL(request.url);
    const batchSizeParam = url.searchParams.get('batchSize');
    const batchSize = batchSizeParam ? parseInt(batchSizeParam, 10) : 10;
    
    // Update company domain URLs
    const result = await updateCompanyDomains(batchSize);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Company domain URLs update process completed',
        updated: result.updated,
        failed: result.failed
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in update-domains API route:', error);
    return NextResponse.json(
      { error: 'Failed to update company domain URLs' },
      { status: 500 }
    );
  }
} 