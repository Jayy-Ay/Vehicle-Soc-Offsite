import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { mergeVehiclesWithAnomalies, useGlobalAnomalyStream } from '@/hooks/useGlobalAnomalyStream'

type Vehicle = Database['public']['Tables']['vehicles']['Row']

export const useVehicles = () => {
  const { anomalies } = useGlobalAnomalyStream()

  const query = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('last_update', { ascending: false })
      
      if (error) throw error
      return data as Vehicle[]
    },
  })

  const data = useMemo(
    () => mergeVehiclesWithAnomalies(query.data, anomalies),
    [query.data, anomalies],
  )

  return {
    ...query,
    data,
  }
}

export const useVehicle = (vehicleId: string) => {
  return useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .single()
      
      if (error) throw error
      return data as Vehicle
    },
    enabled: !!vehicleId,
  })
}

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
  })
}
