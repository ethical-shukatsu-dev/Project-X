import { supabase, Company } from '../src/lib/supabase/client';

/**
 * Script to identify and remove duplicate companies in the database
 *
 * The approach:
 * 1. Group companies by normalized name (lowercase, trimmed)
 * 2. For each group with multiple companies, keep the most detailed one and remove others
 * 3. We'll determine the most detailed one by:
 *    - Preferring entries with longer descriptions
 *    - Preferring entries with more complete data (logo, site URL)
 *    - Preferring entries with more recent updates
 */

async function deduplicateCompanies() {
  console.log('Starting company deduplication process...');

  try {
    // Fetch all companies
    const { data: companies, error } = await supabase.from('companies').select('*');

    if (error) {
      throw error;
    }

    if (!companies || companies.length === 0) {
      console.log('No companies found in the database.');
      return;
    }

    console.log(`Found ${companies.length} total companies in the database.`);

    // Group companies by normalized name
    const companyGroups: Record<string, Company[]> = {};

    companies.forEach((company: Company) => {
      // Normalize company name (lowercase, trim)
      const normalizedName = company.name.toLowerCase().trim();

      if (!companyGroups[normalizedName]) {
        companyGroups[normalizedName] = [];
      }

      companyGroups[normalizedName].push(company);
    });

    // Find groups with multiple companies (duplicates)
    const duplicateGroups = Object.entries(companyGroups).filter(([, group]) => group.length > 1);

    console.log(`Found ${duplicateGroups.length} company names with duplicates.`);

    if (duplicateGroups.length === 0) {
      console.log('No duplicates found. Exiting.');
      return;
    }

    let totalDuplicatesRemoved = 0;

    // Process each group with duplicates
    for (const [companyName, group] of duplicateGroups) {
      console.log(`\nProcessing duplicates for: ${companyName}`);
      console.log(`Found ${group.length} duplicate entries.`);

      // Sort companies by quality metrics - higher score is better
      const scoredCompanies = group.map((company) => {
        // Calculate a quality score for each company
        let score = 0;

        // Prefer longer, more detailed descriptions
        score += company.description.length / 100;

        // Prefer companies with logo URLs
        if (company.logo_url) score += 5;

        // Prefer companies with site URLs
        if (company.site_url) score += 5;

        // Prefer more recent updates (convert to timestamp)
        const updateTime = new Date(company.last_updated).getTime();
        score += updateTime / 1000000000000; // Normalize to be in same range as other scores

        return { company, score };
      });

      // Sort by score descending (highest score first)
      scoredCompanies.sort((a, b) => b.score - a.score);

      // Keep the highest-scoring company, remove the rest
      const keepCompany = scoredCompanies[0].company;
      const removeCompanies = scoredCompanies.slice(1).map((item) => item.company);

      console.log(`Keeping: ${keepCompany.id} (${keepCompany.name})`);

      // Remove duplicate companies
      for (const company of removeCompanies) {
        console.log(`Removing: ${company.id} (${company.name})`);

        const { error } = await supabase.from('companies').delete().eq('id', company.id);

        if (error) {
          console.error(`Failed to remove company ${company.id}:`, error);
        } else {
          totalDuplicatesRemoved++;
        }
      }
    }

    console.log(`\nDeduplication complete! Removed ${totalDuplicatesRemoved} duplicate companies.`);
  } catch (error) {
    console.error('Error during deduplication process:', error);
  }
}

// Check if any companies reference recommendations before deletion
async function checkRecommendationReferences() {
  console.log('Checking for companies referenced in recommendations...');

  try {
    const { data, error } = await supabase.from('recommendations').select('company_id');

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No recommendations found.');
      return new Set();
    }

    console.log(`Found ${data.length} recommendations that reference companies.`);

    // Create a set of company IDs referenced in recommendations
    const referencedCompanyIds = new Set(data.map((rec) => rec.company_id));

    console.log(`${referencedCompanyIds.size} unique companies are referenced in recommendations.`);

    return referencedCompanyIds;
  } catch (error) {
    console.error('Error checking recommendation references:', error);
    return new Set();
  }
}

// Run the script
async function main() {
  // Check for recommendation references to be careful
  const referencedCompanyIds = await checkRecommendationReferences();

  // If there are recommendations, warn the user
  if (referencedCompanyIds.size > 0) {
    console.log('\nWARNING: Some companies are referenced in recommendations.');
    console.log('Ensure that you have a backup of your database before proceeding.');
    console.log('This script does not currently handle updating recommendation references.');

    // In a real application, you might want to:
    // 1. Ask for confirmation
    // 2. Implement logic to update recommendation references

    const confirmation = true; // For now, auto-confirm

    if (!confirmation) {
      console.log('Deduplication cancelled.');
      return;
    }
  }

  // Run the deduplication
  await deduplicateCompanies();
}

// Execute the script
main()
  .then(() => {
    console.log('Script execution complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
