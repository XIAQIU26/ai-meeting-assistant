import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkgniyccugituaundvef.supabase.co';
const supabaseKey = 'sb_publishable_AIBcKBt-UdqupATOgsb2Wg_r0xp5us5';

export const supabase = createClient(supabaseUrl, supabaseKey);
