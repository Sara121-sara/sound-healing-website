import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20))
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}