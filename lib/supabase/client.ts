import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20))
  
  // 在客户端环境变量为空时使用硬编码值（仅用于调试）
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('环境变量未找到，使用硬编码配置')
    return createBrowserClient(
      'https://hhwhwtozhbaztpoyslpx.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhod2h3dG96aGJhenRwb3lzbHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTU1NzUsImV4cCI6MjA2OTQzMTU3NX0.K4tOB_TSqts3_SiGAInquviivIy-AEU1ryTx1UgBP38'
    )
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}