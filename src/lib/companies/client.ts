import { supabase, Company } from '../supabase/client';
import { fetchCompanyData } from '../openai/client';

export async function getOrCreateCompany(companyName: string, industry?: string): Promise<Company> {
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
    const companyData = await fetchCompanyData(companyName, industry);
    
    // Insert into database
    const { data: newCompany, error: insertError } = await supabase
      .from('companies')
      .insert([companyData])
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
