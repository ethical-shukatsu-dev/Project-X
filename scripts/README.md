# Database Maintenance Scripts

This directory contains utility scripts for maintaining the database.

## Company Deduplication Scripts

### Basic Deduplication

To run the basic company deduplication script:

```bash
bun deduplicate-companies
```

This script:

1. Identifies duplicate companies based on their name (case-insensitive)
2. For each set of duplicates, keeps the most complete record and removes others
3. Does not update any recommendation references, so use with caution if you have recommendations

### Deduplication with Reference Handling

For a safer approach that handles recommendation references:

```bash
bun deduplicate-companies-with-refs
```

This script:

1. Identifies duplicate companies based on their name (case-insensitive)
2. For each set of duplicates, keeps the most complete record
3. Updates any recommendation references from the duplicates to the retained company
4. Removes the duplicate companies

### Interactive Deduplication

For maximum control over which company records to keep:

```bash
bun deduplicate-companies-interactive
```

This script:

1. Identifies duplicate companies based on their name (case-insensitive)
2. For each set of duplicates, displays all options with details
3. Lets you choose which record to keep or use "auto" for automatic selection
4. Updates any recommendation references from the duplicates to the selected company
5. Removes the duplicate companies

## How Duplicates Are Resolved

The automatic scripts use a scoring system to determine which company record to keep:

- Longer descriptions add to the score (more detailed info preferred)
- Having a logo URL adds 5 points
- Having a site URL adds 5 points
- More recently updated records are preferred

The interactive script gives you full control over which record to keep, while still showing these quality metrics.

## Important Notes

- Always back up your database before running these scripts
- The scripts will print detailed logs about what they're doing
- If an error occurs, the scripts will log it but continue processing other duplicates
