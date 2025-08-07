'use client'

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">环境变量调试</h1>
      <div className="space-y-2">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <div className="bg-gray-100 p-2 rounded mt-1">
            {supabaseUrl || '未定义'}
          </div>
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY (前20位):</strong>
          <div className="bg-gray-100 p-2 rounded mt-1">
            {supabaseKey ? supabaseKey.substring(0, 20) + '...' : '未定义'}
          </div>
        </div>
        <div>
          <strong>Key 长度:</strong>
          <div className="bg-gray-100 p-2 rounded mt-1">
            {supabaseKey?.length || 0} 字符
          </div>
        </div>
      </div>
    </div>
  )
}