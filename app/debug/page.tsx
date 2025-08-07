'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const testDirectAPI = async () => {
    setLoading(true)
    try {
      // 直接测试 REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`
        }
      })
      
      setTestResult(`REST API 状态: ${response.status} - ${response.statusText}`)
    } catch (error) {
      setTestResult(`REST API 错误: ${error}`)
    }
    setLoading(false)
  }

  const testAuth = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@soundhealing.com',
        password: 'admin123456'
      })
      
      if (error) {
        setTestResult(`认证错误: ${error.message} (代码: ${error.status})`)
      } else {
        setTestResult('认证成功!')
      }
    } catch (error) {
      setTestResult(`认证异常: ${error}`)
    }
    setLoading(false)
  }

  const testKeyValidity = async () => {
    setLoading(true)
    try {
      // 测试 Key 是否有效
      const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResult(`API Key 有效，Auth 设置: ${JSON.stringify(data, null, 2)}`)
      } else {
        setTestResult(`API Key 测试失败: ${response.status} - ${response.statusText}`)
      }
    } catch (error) {
      setTestResult(`API Key 测试错误: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">深度诊断</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <div className="bg-gray-100 p-2 rounded mt-1 text-sm">
            {supabaseUrl || '未定义'}
          </div>
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY (前30位):</strong>
          <div className="bg-gray-100 p-2 rounded mt-1 text-sm">
            {supabaseKey ? supabaseKey.substring(0, 30) + '...' : '未定义'}
          </div>
        </div>
        <div>
          <strong>Key 长度:</strong>
          <div className="bg-gray-100 p-2 rounded mt-1">
            {supabaseKey?.length || 0} 字符
          </div>
        </div>
      </div>

      <div className="space-x-4 mb-6">
        <button 
          onClick={testDirectAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          测试 REST API
        </button>
        <button 
          onClick={testKeyValidity}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          测试 API Key 有效性
        </button>
        <button 
          onClick={testAuth}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          测试认证
        </button>
      </div>

      <div>
        <strong>测试结果:</strong>
        <div className="bg-gray-100 p-4 rounded mt-1 whitespace-pre-wrap text-sm">
          {loading ? '测试中...' : testResult || '点击按钮开始测试'}
        </div>
      </div>
    </div>
  )
}