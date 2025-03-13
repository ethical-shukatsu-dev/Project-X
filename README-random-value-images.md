# Random Value Images Optimization

This document explains how the retrieval of random value images from Supabase is implemented using database functions.

## Problem Solved

The previous implementation fetched all value images for a category and then randomly selected 4 images client-side. This approach had two main issues:

1. **Data Transfer Inefficiency**: Transferring all images when only 4 are needed wasted bandwidth.
2. **Performance**: The application had to wait for all images to be fetched before it could select random ones.

## Solution

We've implemented Supabase database functions that perform the random selection directly in the database, returning only the needed images. This approach:

1. **Reduces Data Transfer**: Only the required images are transferred.
2. **Improves Performance**: The database performs the random selection efficiently.
3. **Simplifies Code**: No need for client-side shuffling and slicing.

## Implementation

### 1. SQL Database Functions

The SQL in the `migrations/20240313_get_random_value_images.sql` file creates two functions in the Supabase database:

- `get_random_value_images_by_category(category_param TEXT, limit_param INTEGER)`: Gets random images for a specific category.
- `get_random_value_images(limit_param INTEGER)`: Gets random images from all categories.

### 2. Client Functions

The `src/lib/values/client.ts` file provides the following functions to interact with these database functions:

- `getRandomValueImagesByCategory(category: string, limit: number = 4)`: Fetches random images for a specific category.
- `getRandomValueImages(limit: number = 4)`: Fetches random images from all categories.
- `getImageQuestions()`: Fetches random images for all categories and organizes them by category.

### 3. Usage in Components

The `ValuesQuestionnaire.tsx` component uses the `getImageQuestions()` function to fetch random images for the questionnaire:

```typescript
import { getImageQuestions } from '@/lib/values/client';

// In your component:
useEffect(() => {
  const fetchImageQuestions = async () => {
    try {
      const images = await getImageQuestions();
      setImageQuestions(images);
    } catch (error) {
      console.error("Error fetching image questions:", error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  fetchImageQuestions();
}, []);
```

## Performance Benefits

The optimized approach:

- Reduces data transfer by only fetching the needed images (4 per category instead of all).
- Eliminates the need for client-side shuffling and slicing.
- Uses a single database query per category instead of fetching all images and processing them client-side.

## Technical Details

### Database Function Implementation

```sql
CREATE OR REPLACE FUNCTION get_random_value_images_by_category(category_param TEXT, limit_param INTEGER DEFAULT 4)
RETURNS SETOF value_images
LANGUAGE SQL
AS $$
  SELECT * FROM value_images 
  WHERE category = category_param
  ORDER BY RANDOM()
  LIMIT limit_param;
$$;
```

### Client Implementation

```typescript
export async function getRandomValueImagesByCategory(category: string, limit: number = 4): Promise<ValueImage[]> {
  const { data, error } = await supabase
    .rpc('get_random_value_images_by_category', {
      category_param: category,
      limit_param: limit
    });

  if (error) {
    console.error('Error fetching random value images:', error);
    throw new Error('Failed to fetch random value images');
  }

  return data || [];
}
```

## Notes

- The `ORDER BY RANDOM()` approach is efficient for small to medium-sized tables. For very large tables, consider alternative randomization methods.
- The default limit is set to 4, but you can specify a different number if needed. 