/**
 * Map of value categories to search queries for image APIs
 * Used for both Pexels and Unsplash API queries
 */
export const VALUE_CATEGORY_QUERIES: Record<string, string[]> = {
  'hobbies': [
    // Outdoor & Adventure
    'hiking adventure', 'mountain climbing', 'camping outdoors', 'fishing nature', 
    'kayaking', 'surfing ocean', 'skiing snow', 'backpacking travel',
    // Creative & Artistic
    'painting art', 'drawing sketch', 'photography creative', 'writing poetry', 
    'playing music', 'singing performance', 'dancing expression', 'crafting handmade',
    // Intellectual & Learning
    'reading books', 'learning languages', 'chess strategy', 'puzzles problem-solving', 
    'history exploration', 'science experiments', 'philosophy thinking', 'documentary watching',
    // Social & Community
    'volunteering community', 'team sports', 'board games friends', 'cooking together', 
    'book club discussion', 'community gardening', 'group travel', 'cultural events',
    // Wellness & Mindfulness
    'yoga practice', 'meditation mindfulness', 'fitness training', 'cycling outdoors', 
    'running marathon', 'swimming exercise', 'healthy cooking', 'nature walks',
    // Technology & Digital
    'video gaming', 'programming coding', 'digital art', 'drone flying', 
    'virtual reality', 'tech gadgets', 'robotics building', 'streaming content'
  ],
  'work_values': [
    'teamwork', 'collaboration', 'productivity', 'achievement', 
    'dedication', 'excellence', 'professionalism', 'growth'
  ],
  'leadership_values': [
    'leadership', 'vision', 'inspiration', 'mentorship', 
    'guidance', 'direction', 'empowerment', 'strategy'
  ],
  'company_culture': [
    'culture', 'diversity', 'inclusion', 'community', 
    'celebration', 'team spirit', 'office culture', 'workplace happiness'
  ],
  'work_environment': [
    'modern office', 'workspace', 'ergonomic', 'collaborative space', 
    'remote work', 'office design', 'productive environment', 'creative space'
  ],
  'innovation': [
    'innovation', 'technology', 'creativity', 'brainstorming', 
    'ideas', 'future', 'digital transformation', 'breakthrough'
  ],
  'personal_professional_growth': [
    'learning', 'development', 'career growth', 'adaptability', 
    'change', 'education', 'skill development', 'personal growth'
  ],
  'work_life_balance': [
    'work-life balance', 'remote work', 'hybrid work', 'mental health', 
    'wellness', 'relaxation', 'flexible work', 'healthy lifestyle'
  ],
  'financial_job_security': [
    'compensation', 'benefits', 'job stability', 'ownership', 
    'equity', 'financial security', 'career stability', 'retirement'
  ],
  'impact_purpose': [
    'social impact', 'sustainability', 'ethical standards', 'mission', 
    'purpose', 'meaningful work', 'environmental responsibility', 'community impact'
  ],
  'communication_transparency': [
    'open communication', 'feedback', 'trust', 'autonomy', 
    'transparency', 'honest conversation', 'information sharing', 'clear communication'
  ],
  'recognition_appreciation': [
    'employee recognition', 'supportive management', 'peer recognition', 'appreciation', 
    'awards', 'acknowledgment', 'gratitude', 'team celebration'
  ]
}; 