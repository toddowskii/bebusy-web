import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = 'https://qxmzaitokuygenbsqhql.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bXphaXRva3V5Z2VuYnNxaHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODYxNjcsImV4cCI6MjA4MDI2MjE2N30.-wUIZJZVHv-gg1O9H8ETSVxK8g6aKZ1ADq4-STiXtD4'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
