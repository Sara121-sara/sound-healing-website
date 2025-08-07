'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Trash2, Music, Play, Pause, Plus } from 'lucide-react'
import type { Database } from '@/types/database'

type AudioFile = Database['public']['Tables']['audio_files']['Row']

export function AudioFileManager() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    file: null as File | null
  })
  
  const supabase = createClient()

  useEffect(() => {
    fetchAudioFiles()
  }, [])

  const fetchAudioFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_files')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) {
        setError('加载音频文件失败')
        return
      }

      setAudioFiles(data || [])
    } catch (error) {
      setError('网络错误，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('audio/')) {
        setUploadForm(prev => ({ ...prev, file }))
        if (!uploadForm.name) {
          setUploadForm(prev => ({ 
            ...prev, 
            name: file.name.replace(/\.[^/.]+$/, '')
          }))
        }
      } else {
        setError('请选择音频文件')
      }
    }
  }

  const uploadAudioFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('未登录')
        return
      }

      const fileExt = uploadForm.file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const filePath = `audio/${fileName}`

      // 上传文件到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, uploadForm.file)

      if (uploadError) {
        setError('文件上传失败: ' + uploadError.message)
        return
      }

      // 保存文件信息到数据库
      const { error: dbError } = await supabase
        .from('audio_files')
        .insert({
          name: uploadForm.name,
          description: uploadForm.description || null,
          storage_path: filePath,
          uploaded_by: user.id
        })

      if (dbError) {
        // 如果数据库保存失败，删除已上传的文件
        await supabase.storage
          .from('audio-files')
          .remove([filePath])
        
        setError('保存文件信息失败')
        return
      }

      setSuccess('音频文件上传成功')
      setUploadForm({ name: '', description: '', file: null })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setIsDialogOpen(false)
      fetchAudioFiles()
    } catch (error) {
      setError('网络错误')
    } finally {
      setUploading(false)
    }
  }

  const deleteAudioFile = async (audioFile: AudioFile) => {
    if (!confirm(`确定要删除 ${audioFile.name} 吗？`)) return

    try {
      // 删除数据库记录
      const { error: dbError } = await supabase
        .from('audio_files')
        .delete()
        .eq('id', audioFile.id)

      if (dbError) {
        setError('删除失败')
        return
      }

      // 删除存储文件
      const { error: storageError } = await supabase.storage
        .from('audio-files')
        .remove([audioFile.storage_path])

      if (storageError) {
        console.warn('删除存储文件失败:', storageError)
      }

      setSuccess('文件删除成功')
      setAudioFiles(prev => prev.filter(f => f.id !== audioFile.id))
    } catch (error) {
      setError('删除失败')
    }
  }

  const getAudioUrl = async (path: string) => {
    const { data } = supabase.storage
      .from('audio-files')
      .getPublicUrl(path)
    return data.publicUrl
  }

  const handlePlay = async (audioFile: AudioFile) => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setPlayingId(null)
    }

    if (playingId === audioFile.id) {
      return
    }

    try {
      const audioUrl = await getAudioUrl(audioFile.storage_path)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        setPlayingId(null)
        setCurrentAudio(null)
      }

      audio.onerror = () => {
        setError('播放失败')
        setPlayingId(null)
        setCurrentAudio(null)
      }

      setCurrentAudio(audio)
      setPlayingId(audioFile.id)
      audio.play()
    } catch (error) {
      setError('播放失败')
    }
  }

  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setPlayingId(null)
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
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">音频文件管理</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              上传音频
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>上传音频文件</DialogTitle>
            </DialogHeader>
            <form onSubmit={uploadAudioFile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">音频文件</label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">显示名称</label>
                <Input
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：静心冥想曲"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">描述（可选）</label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="简短描述这个音频的内容和用途"
                  rows={3}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    上传文件
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {audioFiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无音频文件</p>
            <p className="text-gray-400 text-sm mt-2">点击&quot;上传音频&quot;开始添加内容</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {audioFiles.map((audioFile) => (
            <Card key={audioFile.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center">
                    <Music className="w-5 h-5 mr-2 text-gray-500" />
                    {audioFile.name}
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteAudioFile(audioFile)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {audioFile.description && (
                  <p className="text-gray-600 text-sm">{audioFile.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    上传时间: {new Date(audioFile.uploaded_at).toLocaleString('zh-CN')}
                  </div>
                  
                  <Button
                    onClick={() => 
                      playingId === audioFile.id 
                        ? handleStop() 
                        : handlePlay(audioFile)
                    }
                    variant={playingId === audioFile.id ? "secondary" : "default"}
                    size="sm"
                  >
                    {playingId === audioFile.id ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        暂停
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        试听
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}