import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hklvpebvphfvremlpyqv.supabase.co/rest/v1/'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Onq6OZSH6SvyWiON3z9C3w_txPcR5SN'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
