# Value Images Feature

This feature allows you to use images for value-based questions in the questionnaire. It includes functionality to upload images manually or fetch them automatically from the Pexels API.

## Setup

### 1. Pexels API Key

To use the Pexels API integration, you need to obtain an API key:

1. Sign up for a free account at [Pexels](https://www.pexels.com/join-consumer/)
2. Once logged in, go to [Pexels API](https://www.pexels.com/api/) and request an API key
3. Add your API key to the `.env.local` file:

```
PEXELS_API_KEY=your_pexels_api_key_here
```

### 2. Supabase Storage

Make sure you have a bucket named `images` in your Supabase storage. If not, create one:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket named `images`
4. Set the appropriate permissions (public read access is recommended for this use case)

## Usage

### Admin Interface

The admin interface for value images is available at `/[lng]/admin/value-images`. It provides two main functionalities:

1. **Upload Images**: Upload images manually with metadata
2. **Fetch from Pexels**: Automatically fetch images from Pexels API based on value categories

#### Uploading Images Manually

1. Go to the "Upload Image" tab
2. Select an image file
3. Choose a category
4. Enter a value name
5. Optionally add a description and tags
6. Click "Upload Image"

#### Fetching Images from Pexels

1. Go to the "Fetch from Pexels" tab
2. Select a category (or leave empty to fetch for all categories)
3. Set the number of images to fetch
4. Click "Fetch Images from Pexels"

### Value Categories

The following value categories are defined:

- **Work Values**: Teamwork, collaboration, productivity, etc.
- **Leadership Values**: Leadership, vision, inspiration, etc.
- **Company Culture**: Culture, diversity, inclusion, etc.
- **Work Environment**: Modern office, workspace, ergonomic, etc.
- **Innovation**: Innovation, technology, creativity, etc.
- **Personal & Professional Growth**: Learning & development, career growth, adaptability & change, etc.
- **Work-Life Balance & Well-being**: Work-life balance, remote & hybrid work, mental health & wellness, etc.
- **Financial & Job Security**: Compensation & benefits, job stability, ownership & equity, etc.
- **Impact & Purpose**: Social impact & sustainablity, ethical standards, mission alignment, etc.
- **Communication & Transparency**: Open communication, feedback culture, trust & autonomy, etc.
- **Recognition & Appreciation**: Employee recognition, supportive management, peer recognition, etc.
- **Hobbies & Interests**: Activities and interests outside of work, including:
  - **Outdoor & Adventure**: Hiking, camping, fishing, kayaking, etc.
  - **Creative & Artistic**: Painting, photography, music, dancing, etc.
  - **Intellectual & Learning**: Reading, languages, chess, puzzles, etc.
  - **Social & Community**: Volunteering, team sports, board games, etc.
  - **Wellness & Mindfulness**: Yoga, meditation, fitness, cycling, etc.
  - **Technology & Digital**: Gaming, programming, digital art, etc.

Each category has predefined search queries that are used when fetching images from Pexels.

### Value Association System

The system associates images with specific values to create a training dataset for future UI/UX improvements. For example:

- A landscape image might be associated with values like "calm environment" and "modesty"
- A party image might be associated with values like "outgoing" and "social connection"
- A hiking image might be associated with values like "adventure" and "nature appreciation"

This association helps the system understand user preferences based on their image selections, providing more personalized recommendations.

## API Endpoints

### `POST /api/value-images`

- **Form Data Upload**: Upload an image file with metadata
- **JSON Request**: Fetch images from Pexels API

#### Fetch from Pexels Example

```javascript
const response = await fetch('/api/value-images', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'fetch_pexels',
    category: 'work_values', // Optional, leave empty for all categories
    count: 10 // Number of images to fetch
  })
});

const data = await response.json();
```

### `GET /api/value-images`

Fetch all value images or filter by category:

```javascript
// Fetch all images
const response = await fetch('/api/value-images');

// Filter by category
const response = await fetch('/api/value-images?category=work_values');
```

## Integration with Questionnaire

The value images can be used in the questionnaire to create image-based questions. This provides a more engaging and visual experience for users.

## Troubleshooting

- **API Key Issues**: Make sure your Pexels API key is correctly set in the `.env.local` file
- **Storage Issues**: Check that your Supabase storage bucket exists and has the correct permissions
- **Image Upload Failures**: Ensure the image file is valid and not too large (recommended max size: 5MB) 