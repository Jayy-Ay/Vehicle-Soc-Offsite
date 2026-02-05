import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type Alert = Database['public']['Tables']['alerts']['Row']

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
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
