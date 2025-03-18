import { supabaseAdmin } from '../src/lib/supabase/admin-client';

// Define a minimal type for what we need from companies
type CompanyRecord = {
  id: string;
  name: string;
  site_url: string | null;
  last_updated: string;
};

async function deduplicateCompanies() {
  try {
    console.log('Starting company deduplication process...');
    
    // Get all companies with their site_url
    console.log('Step 1: Fetching all companies with site_url...');
    const { data: companies, error: fetchError } = await supabaseAdmin
      .from('companies')
      .select('id, name, site_url, last_updated')
      .not('site_url', 'is', null)
      .order('last_updated', { ascending: false });
    
    if (fetchError) {
      throw new Error(`Error fetching companies: ${fetchError.message}`);
    }
    
    console.log(`Found ${companies?.length || 0} companies with site_url.`);
    
    // Group companies by site_url and find duplicates
    const companiesByUrl = new Map<string, CompanyRecord[]>();
    const duplicates: CompanyRecord[] = [];
    const keepers = new Map<string, CompanyRecord>();
    
    // First pass: group by site_url and identify the most recent record to keep
    companies?.forEach((company: CompanyRecord) => {
      if (!company.site_url) return;
      
      // Normalize URL to handle variations (remove trailing slash, lowercase)
      const normalizedUrl = company.site_url.toLowerCase().replace(/\/+$/, '');
      
      if (!companiesByUrl.has(normalizedUrl)) {
        companiesByUrl.set(normalizedUrl, []);
      }
      
      const companyArray = companiesByUrl.get(normalizedUrl);
      if (companyArray) {
        companyArray.push(company);
      }
      
      // For each site_url, we'll keep the record with the most recent last_updated
      const currentKeeper = keepers.get(normalizedUrl);
      if (!currentKeeper || new Date(company.last_updated) > new Date(currentKeeper.last_updated)) {
        keepers.set(normalizedUrl, company);
      }
    });
    
    // Second pass: identify duplicates to remove
    for (const [url, urlCompanies] of companiesByUrl.entries()) {
      if (urlCompanies.length > 1) {
        const keeper = keepers.get(url);
        if (keeper) {
          duplicates.push(...urlCompanies.filter((c: CompanyRecord) => c.id !== keeper.id));
        }
      }
    }
    
    console.log(`Found ${duplicates.length} duplicate companies to delete.`);
    
    if (duplicates.length === 0) {
      console.log('No duplicates found. Exiting...');
      return;
    }
    
    // Collect the IDs of duplicates to delete
    const duplicateIds = duplicates.map(d => d.id);
    
    // Check for recommendations referencing companies to be deleted
    console.log('Step 2: Checking for affected recommendations...');
    const { data: affectedRecs, error: recsError } = await supabaseAdmin
      .from('recommendations')
      .select('id, company_id')
      .in('company_id', duplicateIds);
    
    if (recsError) {
      throw new Error(`Error checking recommendations: ${recsError.message}`);
    }
    
    console.log(`Found ${affectedRecs?.length || 0} recommendations referencing companies to be deleted.`);
    
    // Update recommendations if needed
    if (affectedRecs && affectedRecs.length > 0) {
      console.log('Step 3: Updating recommendations...');
      
      // Create mapping from duplicate company ID to keeper company ID
      const companyIdMap = new Map<string, string>();
      for (const duplicate of duplicates) {
        if (!duplicate.site_url) continue;
        
        const url = duplicate.site_url.toLowerCase().replace(/\/+$/, '');
        const keeper = keepers.get(url);
        if (keeper) {
          companyIdMap.set(duplicate.id, keeper.id);
        }
      }
      
      // Update each recommendation
      let updatedCount = 0;
      for (const rec of affectedRecs) {
        const newCompanyId = companyIdMap.get(rec.company_id);
        if (newCompanyId) {
          const { error: updateError } = await supabaseAdmin
            .from('recommendations')
            .update({ company_id: newCompanyId })
            .eq('id', rec.id);
          
          if (updateError) {
            console.error(`Error updating recommendation ${rec.id}:`, updateError);
          } else {
            updatedCount++;
          }
        }
      }
      
      console.log(`Updated ${updatedCount} recommendations successfully.`);
    }
    
    // Delete the duplicate companies
    console.log('Step 4: Deleting duplicate companies...');
    const { error: deleteError } = await supabaseAdmin
      .from('companies')
      .delete()
      .in('id', duplicateIds);
    
    if (deleteError) {
      throw new Error(`Error deleting companies: ${deleteError.message}`);
    }
    
    console.log(`Successfully deleted ${duplicateIds.length} duplicate companies.`);
    console.log('Company deduplication completed successfully.');
    
  } catch (error) {
    console.error('Error during company deduplication:', error);
  }
}

// Execute the function
deduplicateCompanies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 