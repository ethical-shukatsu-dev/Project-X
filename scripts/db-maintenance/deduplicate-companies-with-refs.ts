import { supabase, Company } from '../src/lib/supabase/client';

/**
 * Script to identify and remove duplicate companies in the database
 * including handling references in the recommendations table
 *
 * The approach:
 * 1. Group companies by normalized name (lowercase, trimmed)
 * 2. For each group with multiple companies, keep the most detailed one and update references to others
 * 3. Remove the duplicate companies after updating all references
 */

// Function to update recommendation references from one company ID to another
async function updateRecommendationReferences(
  fromCompanyId: string,
  toCompanyId: string
): Promise<number> {
  try {
    // Find recommendations referencing the duplicate company
    const { data, error: fetchError } = await supabase
      .from('recommendations')
      .select('id')
      .eq('company_id', fromCompanyId);

    if (fetchError) {
      console.error('Error fetching recommendations:', fetchError);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0; // No recommendations to update
    }

    // Update the references to point to the company we're keeping
    const { error: updateError } = await supabase
      .from('recommendations')
      .update({ company_id: toCompanyId })
      .eq('company_id', fromCompanyId);

    if (updateError) {
      console.error('Error updating recommendation references:', updateError);
      return 0;
    }

    return data.length; // Return count of updated recommendations
  } catch (error) {
    console.error('Error in updateRecommendationReferences:', error);
    return 0;
  }
}

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
    let totalReferencesUpdated = 0;

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

      // Keep the highest-scoring company, update references to others then remove them
      const keepCompany = scoredCompanies[0].company;
      const removeCompanies = scoredCompanies.slice(1).map((item) => item.company);

      console.log(`Keeping: ${keepCompany.id} (${keepCompany.name})`);

      // Update references and remove duplicate companies
      for (const company of removeCompanies) {
        console.log(`Processing duplicate: ${company.id} (${company.name})`);

        // Update any recommendation references
        const updatedCount = await updateRecommendationReferences(company.id, keepCompany.id);

        if (updatedCount > 0) {
          console.log(
            `Updated ${updatedCount} recommendation references from ${company.id} to ${keepCompany.id}`
          );
          totalReferencesUpdated += updatedCount;
        }

        // After updating references, delete the duplicate company
        const { error } = await supabase.from('companies').delete().eq('id', company.id);

        if (error) {
          console.error(`Failed to remove company ${company.id}:`, error);
        } else {
          console.log(`Removed company ${company.id}`);
          totalDuplicatesRemoved++;
        }
      }
    }

    console.log(`\nDeduplication complete!`);
    console.log(`- Removed ${totalDuplicatesRemoved} duplicate companies`);
    console.log(`- Updated ${totalReferencesUpdated} recommendation references`);
  } catch (error) {
    console.error('Error during deduplication process:', error);
  }
}

// Run the script
async function main() {
  // Run the deduplication with reference handling
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
