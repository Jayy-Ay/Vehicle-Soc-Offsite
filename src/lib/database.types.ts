export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          vehicle_id: string
          model: string
          location: string
          tee_status: 'secure' | 'warning' | 'critical'
          tee_total: number
          tee_secure: number
          tee_warning: number
          tee_critical: number
          last_update: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          model: string
          location: string
          tee_status: 'secure' | 'warning' | 'critical'
          tee_total: number
          tee_secure: number
          tee_warning: number
          tee_critical: number
          last_update?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          model?: string
          location?: string
          tee_status?: 'secure' | 'warning' | 'critical'
          tee_total?: number
          tee_secure?: number
          tee_warning?: number
          tee_critical?: number
          last_update?: string
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          alert_id: string
          severity: 'high' | 'medium' | 'low' | 'benign'
          title: string
          description: string
          vehicle_id: string
          tee_id: string
          status: 'pending' | 'investigating' | 'resolved'
          timestamp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          alert_id: string
          severity: 'high' | 'medium' | 'low' | 'benign'
          title: string
          description: string
          vehicle_id: string
          tee_id: string
          status?: 'pending' | 'investigating' | 'resolved'
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          alert_id?: string
          severity?: 'high' | 'medium' | 'low' | 'benign'
          title?: string
          description?: string
          vehicle_id?: string
          tee_id?: string
          status?: 'pending' | 'investigating' | 'resolved'
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
      }
      threat_metrics: {
        Row: {
          id: string
          timestamp: string
          critical_count: number
          warning_count: number
          info_count: number
          created_at: string
        }
        Insert: {
          id?: string
          timestamp: string
          critical_count: number
          warning_count: number
          info_count: number
          created_at?: string
        }
        Update: {
          id?: string
          timestamp?: string
          critical_count?: number
          warning_count?: number
          info_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
