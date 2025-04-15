import { supabase, Company } from '../src/lib/supabase/client';
import * as readline from 'readline';

/**
 * Interactive script to identify and remove duplicate companies in the database
 * with user prompts to choose which company to keep
 *
 * The approach:
 * 1. Group companies by normalized name (lowercase, trimmed)
 * 2. For each group with multiple companies, display all options and let the user choose
 * 3. Update recommendation references and remove the duplicates based on user selection
 */

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to get user input asynchronously
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Format company details for display
function formatCompanyDetails(company: Company, index: number): string {
  return `
[${index}] ID: ${company.id}
    Name: ${company.name}
    Industry: ${company.industry}
    Size: ${company.size}
    Description: ${company.description.substring(0, 100)}${company.description.length > 100 ? '...' : ''}
    Logo URL: ${company.logo_url || 'None'}
    Site URL: ${company.site_url || 'None'}
    Last Updated: ${company.last_updated}
  `;
}

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

async function deduplicateCompaniesInteractive() {
  console.log('Starting interactive company deduplication process...');

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
      console.log(`\n======================================================`);
      console.log(`Processing duplicates for: ${companyName}`);
      console.log(`Found ${group.length} duplicate entries.`);
      console.log(`======================================================\n`);

      // Display all options with details
      console.log('Choose which company record to keep:');
      group.forEach((company, index) => {
        console.log(formatCompanyDetails(company, index + 1));
      });

      // Get user choice
      const answer = await prompt(
        'Enter the number of the company to keep (or "auto" to use automatic selection): '
      );

      let keepCompanyIndex = -1;

      if (answer.toLowerCase() === 'auto') {
        // Use automatic scoring system
        const scoredCompanies = group.map((company, index) => {
          let score = 0;
          score += company.description.length / 100;
          if (company.logo_url) score += 5;
          if (company.site_url) score += 5;
          const updateTime = new Date(company.last_updated).getTime();
          score += updateTime / 1000000000000;
          return { index, score };
        });

        // Sort by score descending
        scoredCompanies.sort((a, b) => b.score - a.score);
        keepCompanyIndex = scoredCompanies[0].index;

        console.log(`Auto-selected company #${keepCompanyIndex + 1}.`);
      } else {
        // User selection
        const selectedIndex = parseInt(answer, 10);

        if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > group.length) {
          console.log('Invalid selection. Skipping this company group.');
          continue;
        }

        keepCompanyIndex = selectedIndex - 1;
      }

      // Process the user's choice
      const keepCompany = group[keepCompanyIndex];
      const removeCompanies = group.filter((_, index) => index !== keepCompanyIndex);

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
  } finally {
    // Close the readline interface
    rl.close();
  }
}

// Run the script
async function main() {
  // Run the interactive deduplication
  await deduplicateCompaniesInteractive();
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
