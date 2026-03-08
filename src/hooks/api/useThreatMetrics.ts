import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { demoThreatMetrics } from '@/lib/demo-data'

type ThreatMetric = Database['public']['Tables']['threat_metrics']['Row']

export const useThreatMetrics = (hours: number = 24) => {
  return useQuery({
    queryKey: ['threat-metrics', hours],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured) {
        return demoThreatMetrics.slice(-hours) as ThreatMetric[]
      }

      const startTime = new Date()
      startTime.setHours(startTime.getHours() - hours)
      
      const { data, error } = await supabase
        .from('threat_metrics')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true })
      
      if (error) throw error
      return data as ThreatMetric[]
    },
  })
}
