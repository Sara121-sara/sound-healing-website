export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          wechat_name: string
          phone: string
          service: string
          appointment_time: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          wechat_name: string
          phone: string
          service: string
          appointment_time: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          wechat_name?: string
          phone?: string
          service?: string
          appointment_time?: string
          status?: string
          created_at?: string
        }
      }
      audio_files: {
        Row: {
          id: string
          name: string
          storage_path: string
          description: string | null
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          name: string
          storage_path: string
          description?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          name?: string
          storage_path?: string
          description?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
      }
    }
  }
}