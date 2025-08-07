'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            声音疗愈中心
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => document.getElementById('audio-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              音频库
            </button>
            <button
              onClick={() => document.getElementById('appointment-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              预约疗愈
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    管理后台
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  退出登录
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  管理员登录
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}