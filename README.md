# Project X - Values-Based Company Matching Platform

Project X is a web application that helps job-seeking students find companies that align with their values and interests. The platform uses AI to match users with companies based on a short questionnaire.

## Features

- **Simple Values Questionnaire**: Complete a short questionnaire about your work preferences and interests in under 3 minutes.
- **AI-Powered Recommendations**: Get personalized company recommendations based on your values and interests.
- **Company Details**: View detailed information about each recommended company, including why it's a good match for you.
- **Feedback System**: Provide feedback on recommendations to improve future matches.
- **Visual Values Selection**: Choose values through image-based selection for a more intuitive experience.

## Tech Stack

- **Frontend**: Next.js, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **AI**: OpenAI API
- **Deployment**: Vercel
- **Runtime**: Bun

## Getting Started

### Prerequisites

- Bun (v1.0 or later)
- Supabase account
- OpenAI API key

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

1. Create a new Supabase project
2. Create the necessary tables by following the instructions in `SUPABASE_SETUP.md`
3. Run the SQL script in `setup-tables.sql` to create tables and add sample data
4. Verify your Supabase setup by running:

```bash
bun run verify-supabase
```

This will check if your Supabase connection is working and if all required tables are set up correctly.

**user_values**
```sql
CREATE TABLE user_values (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  values JSONB NOT NULL,
  interests TEXT[] NOT NULL,
  selected_image_values JSONB
);
```

**companies**
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  size TEXT NOT NULL,
  values JSONB NOT NULL,
  logo_url TEXT,
  site_url TEXT,
  data_source TEXT DEFAULT 'manual',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**recommendations**
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_values(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  matching_points TEXT[] NOT NULL,
  feedback TEXT
);
```

**value_images**
```sql
CREATE TABLE value_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(255) NOT NULL, -- e.g., 'work_environment', 'leadership_style'
  value_name VARCHAR(255) NOT NULL, -- e.g., 'collaborative', 'mentorship'
  image_url TEXT NOT NULL,
  description TEXT, -- Description of what the image represents
  tags TEXT[], -- Array of tags for better categorization and searching
  pexels_id TEXT, -- The Pexels photo ID for proper attribution
  unsplash_id TEXT, -- The Unsplash photo ID for proper attribution
  attribution JSONB, -- Attribution information including photographer name, photographer URL, and photo URL
  image_sizes JSONB -- Different size variants of the image for responsive usage
);
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/project-x.git
cd project-x
```

2. Install dependencies
```bash
bun install
```

3. Run the development server
```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
