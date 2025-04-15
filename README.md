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

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/project-x.git
cd project-x
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

1. Install the Supabase CLI:

Using Homebrew (recommended):

```bash
brew install supabase/tap/supabase
```

Or using Bun:

```bash
bun add -D supabase
```

Note: For Bun versions below v1.0.17, you must add `supabase` as a trusted dependency before installation.

2. Initialize Supabase in your project:

```bash
supabase init
```

3. Link your project:

```bash
supabase link --project-ref your-project-ref
```

4. Run the migrations:

```bash
supabase db push
```

This will create all necessary tables and functions:

- Core tables (`user_values`, `companies`, `recommendations`, `value_images`)
- Analytics tables (`analytics_events`, `ab_testing`)
- Analytics functions for tracking user behavior and generating reports
- Value images functions for managing and retrieving value-based images

5. Start the development server:

```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation

Detailed documentation is organized in the following sections:

### Features

- [Analytics Custom Date Range](docs/features/analytics-custom-date-range.md)
- [Random Value Images](docs/features/random-value-images.md)
- [Value Images Management](docs/features/value-images.md)

### Setup & Configuration

- [Database Schema](docs/database-schema.md)
- [Supabase Setup Guide](docs/setup/supabase.md)

### Testing

- [Supabase Integration Testing](docs/testing/supabase-integration.md)

## Deployment

The application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
