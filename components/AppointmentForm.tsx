'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, AlertCircle } from 'lucide-react'

export function AppointmentForm() {
  const [formData, setFormData] = useState({
    wechat_name: '',
    phone: '',
    service: '',
    appointment_time: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const services = [
    '30分钟声音浴',
    '60分钟个案疗愈',
    '90分钟深度疗愈',
    '团体声音疗愈',
    '私人定制疗愈'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          wechat_name: formData.wechat_name,
          phone: formData.phone,
          service: formData.service,
          appointment_time: formData.appointment_time,
          status: 'pending'
        })

      if (error) {
        setError('预约提交失败，请稍后再试')
        return
      }

      setSuccess(true)
      setFormData({
        wechat_name: '',
        phone: '',
        service: '',
        appointment_time: '',
        message: ''
      })
    } catch (error) {
      setError('网络错误，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              预约提交成功！
            </h3>
            <p className="text-gray-600 mb-4">
              我们将在24小时内联系您确认预约详情
            </p>
            <Button onClick={() => setSuccess(false)} variant="outline">
              继续预约
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>预约个案疗愈</CardTitle>
        <CardDescription>
          请填写以下信息，我们将尽快与您联系确认预约
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="wechat_name" className="text-sm font-medium text-gray-700">
              微信昵称 *
            </label>
            <Input
              id="wechat_name"
              value={formData.wechat_name}
              onChange={(e) => handleChange('wechat_name', e.target.value)}
              required
              placeholder="请输入您的微信昵称"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              联系电话 *
            </label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
              placeholder="请输入您的手机号码"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="service" className="text-sm font-medium text-gray-700">
              预约服务 *
            </label>
            <Select onValueChange={(value) => handleChange('service', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="请选择服务项目" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="appointment_time" className="text-sm font-medium text-gray-700">
              希望预约时间 *
            </label>
            <Input
              id="appointment_time"
              type="datetime-local"
              value={formData.appointment_time}
              onChange={(e) => handleChange('appointment_time', e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700">
              备注信息
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="如有特殊需求或问题，请在此说明"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? '提交中...' : '提交预约'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}