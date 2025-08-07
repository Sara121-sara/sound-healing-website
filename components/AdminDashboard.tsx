'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AudioFileManager } from '@/components/AudioFileManager'
import { AppointmentManager } from '@/components/AppointmentManager'
import { Button } from '@/components/ui/button'
import { LogOut, Music, Calendar, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function AdminDashboard() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">管理员后台</h1>
          <p className="text-gray-600 mt-1">
            欢迎回来，{user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appointments" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            预约管理
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center">
            <Music className="w-4 h-4 mr-2" />
            音频管理
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4">
          <AppointmentManager />
        </TabsContent>
        
        <TabsContent value="audio" className="space-y-4">
          <AudioFileManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}