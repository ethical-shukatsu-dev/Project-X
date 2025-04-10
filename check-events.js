import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEvents() {
  console.log('Checking events...');

  // Check all survey start clicks
  const { data: startClicks, error: startError } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('event_type', 'survey_start_click');

  if (startError) console.error('Error fetching start clicks:', startError);
  console.log('Survey start clicks:', startClicks?.length || 0);
  if (startClicks?.length > 0)
    console.log('First start click:', JSON.stringify(startClicks[0], null, 2));

  // Check all abandoned events
  const { data: abandonedEvents, error: abandonedError } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('event_type', 'survey_step_abandoned');

  if (abandonedError) console.error('Error fetching abandoned events:', abandonedError);
  console.log('Survey abandoned events:', abandonedEvents?.length || 0);
  if (abandonedEvents?.length > 0)
    console.log('First abandoned event:', JSON.stringify(abandonedEvents[0], null, 2));

  // Check all completed steps
  const { data: completedEvents, error: completedError } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('event_type', 'survey_step_completed');

  if (completedError) console.error('Error fetching completed events:', completedError);
  console.log('Survey completed steps:', completedEvents?.length || 0);
}

checkEvents().catch(console.error);
