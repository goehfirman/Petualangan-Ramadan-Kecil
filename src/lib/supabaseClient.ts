
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wiximlwnspaltumxonjg.supabase.co';
const supabaseKey = 'sb_publishable_jsTa62MnUEa7bA0VK5ZjDA_jpxGgDDK';

export const supabase = createClient(supabaseUrl, supabaseKey);
