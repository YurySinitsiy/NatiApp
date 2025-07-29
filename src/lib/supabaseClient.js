import {
    createClient
} from '@supabase/supabase-js'

const supabaseUrl = 'https://rsnxuixehjvlkvojenrq.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbnh1aXhlaGp2bGt2b2plbnJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzUxMDg3NSwiZXhwIjoyMDY5MDg2ODc1fQ.O1ryqPiQ-FFykKzfwu8XHu3ow-uJIWVXLpvIduNwlIs"
                    
export const supabase = createClient(supabaseUrl, supabaseKey)