import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from './database.types';

export const supabase = createClient<Database>(environment.supabase.url, environment.supabase.key);
