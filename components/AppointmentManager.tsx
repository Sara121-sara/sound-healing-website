'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Phone, Calendar, User, Clock } from 'lucide-react'
import type { Database } from '@/types/database'

type Appointment = Database['public']['Tables']['appointments']['Row']

const statusMap = {
  pending: { label: '待确认', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
  completed: { label: '已完成', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' }
}

export function AppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError('加载预约失败')
        return
      }

      setAppointments(data || [])
    } catch (error) {
      setError('网络错误，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    setError('')

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)

      if (error) {
        setError('更新状态失败')
        return
      }

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id ? { ...apt, status } : apt
        )
      )
    } catch (error) {
      setError('网络错误')
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('确定要删除这个预约吗？')) return

    setUpdatingId(id)
    setError('')

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) {
        setError('删除失败')
        return
      }

      setAppointments(prev => prev.filter(apt => apt.id !== id))
    } catch (error) {
      setError('网络错误')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">预约管理</h2>
        <div className="text-sm text-gray-500">
          共 {appointments.length} 个预约
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无预约记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.appointment_time)
            const statusInfo = statusMap[appointment.status as keyof typeof statusMap]

            return (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center">
                      <User className="w-5 h-5 mr-2 text-gray-500" />
                      {appointment.wechat_name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {appointment.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {date}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {time}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">服务：</span>
                        {appointment.service}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-400">
                      预约时间: {new Date(appointment.created_at).toLocaleString('zh-CN')}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Select
                        value={appointment.status}
                        onValueChange={(status) => updateAppointmentStatus(appointment.id, status)}
                        disabled={updatingId === appointment.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">待确认</SelectItem>
                          <SelectItem value="confirmed">已确认</SelectItem>
                          <SelectItem value="cancelled">已取消</SelectItem>
                          <SelectItem value="completed">已完成</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAppointment(appointment.id)}
                        disabled={updatingId === appointment.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}