import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { demoAlerts } from '@/lib/demo-data'

type Alert = Database['public']['Tables']['alerts']['Row']

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured) {
        return demoAlerts as Alert[]
      }

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false })
      
      if (error) throw error
      return data as Alert[]
    },
  })
}

export const useAlert = (alertId: string) => {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured) {
        return demoAlerts.find((alert) => alert.alert_id === alertId) as Alert
      }

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('alert_id', alertId)
        .single()
      
      if (error) throw error
      return data as Alert
    },
    enabled: !!alertId,
  })
}

export const useUpdateAlert = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Alert> & { id: string }) => {
      if (!supabase || !isSupabaseConfigured) {
        throw new Error('Alert updates are disabled in demo mode')
      }

      const { data, error } = await supabase
        .from('alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export const useAlertsByStatus = (status: 'pending' | 'investigating' | 'resolved') => {
  return useQuery({
    queryKey: ['alerts', 'status', status],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured) {
        return demoAlerts.filter((alert) => alert.status === status) as Alert[]
      }

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', status)
        .order('timestamp', { ascending: false })
      
      if (error) throw error
      return data as Alert[]
    },
  })
}

export const useAlertsBySeverity = (severity: 'high' | 'medium' | 'low' | 'benign') => {
  return useQuery({
    queryKey: ['alerts', 'severity', severity],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured) {
        return demoAlerts.filter((alert) => alert.severity === severity) as Alert[]
      }

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('severity', severity)
        .order('timestamp', { ascending: false })
      
      if (error) throw error
      return data as Alert[]
    },
  })
}
