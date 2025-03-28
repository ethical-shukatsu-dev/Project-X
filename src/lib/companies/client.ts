import { supabase, Company } from '../supabase/client';
import { fetchCompanyData } from '../openai/client';
import { fetchCompanyLogo } from '../openai/client';

/**
 * Updates existing companies in the database with logos if they don't have one
 */
export async function updateCompanyLogos(): Promise<void> {
  try {
    // Get all companies without logos
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .is('logo_url', null);

    if (error) {
      console.error('Error fetching companies without logos:', error);
      return;
    }

    if (!companies || companies.length === 0) {
      console.log('No companies without logos found');
      return;
    }

    console.log(`Found ${companies.length} companies without logos. Updating...`);

    // Update each company with a new logo
    for (const company of companies) {
      // Fetch just the logo instead of all company data
      const logoUrl = await fetchCompanyLogo(company.name, company.site_url);
      
      if (!logoUrl) {
        console.log(`Could not find logo for company ${company.name}`);
        continue;
      }
      
      // Update the company in the database
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('id', company.id);
      
      if (updateError) {
        console.error(`Error updating logo for company ${company.name}:`, updateError);
      } else {
        console.log(`Updated logo for company ${company.name}`);
      }
    }

    console.log('Finished updating company logos');
  } catch (error) {
    console.error('Error updating company logos:', error);
  }
}

export async function getOrCreateCompany(companyName: string, industry?: string, locale: string = 'en'): Promise<Company> {
  try {
    // Check if company exists in database
    const { data: existingCompany, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', companyName)
      .single();

    if (!error && existingCompany) {
      return existingCompany as Company;
    }

    // If company doesn't exist, fetch from OpenAI
    const companyData = await fetchCompanyData(companyName, industry, locale);
    
    // Extract the company_values field if present
    const { company_values, ...standardCompanyData } = companyData;
    
    // Prepare the company data for insertion
    const companyToInsert = {
      ...standardCompanyData,
      company_values: company_values || null,
    };
    
    // Insert into database
    const { data: newCompany, error: insertError } = await supabase
      .from('companies')
      .insert([companyToInsert])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting company data:', insertError);
      throw new Error('Failed to save company data');
    }

    return newCompany as Company;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
}
