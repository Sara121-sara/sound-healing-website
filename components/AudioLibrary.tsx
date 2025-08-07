'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'
import type { Database } from '@/types/database'

type AudioFile = Database['public']['Tables']['audio_files']['Row']

export function AudioLibrary() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  
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
        console.error('Error fetching audio files:', error)
        return
      }

      setAudioFiles(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
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
        console.error('Error loading audio file')
        setPlayingId(null)
        setCurrentAudio(null)
      }

      setCurrentAudio(audio)
      setPlayingId(audioFile.id)
      audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (audioFiles.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">暂无音频文件</p>
        <p className="text-gray-400 text-sm mt-2">管理员可以在后台上传疗愈音频</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`grid gap-6 ${
        audioFiles.length === 1 
          ? 'grid-cols-1 max-w-md mx-auto' 
          : 'grid-cols-1 sm:grid-cols-2'
      }`}>
        {audioFiles.map((audioFile) => (
        <Card key={audioFile.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{audioFile.name}</CardTitle>
            {audioFile.description && (
              <CardDescription>{audioFile.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => 
                playingId === audioFile.id 
                  ? handleStop() 
                  : handlePlay(audioFile)
              }
              className="w-full"
              variant={playingId === audioFile.id ? "secondary" : "default"}
            >
              {playingId === audioFile.id ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  暂停播放
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  播放音频
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        ))}
      </div>
    </div>
  )
}