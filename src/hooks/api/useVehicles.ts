import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { demoVehicles } from '@/lib/demo-data'

type Vehicle = Database['public']['Tables']['vehicles']['Row']

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured) {
        return demoVehicles as Vehicle[]
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('last_update', { ascending: false })
      
      if (error) throw error
      return data as Vehicle[]
    },
  })
}

export const useVehicle = (vehicleId: string) => {
  return useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      if (!supabase || !isSupabaseConfigured) {
        return demoVehicles.find((vehicle) => vehicle.vehicle_id === vehicleId) as Vehicle
      }

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
      if (!supabase || !isSupabaseConfigured) {
        throw new Error('Vehicle updates are disabled in demo mode')
      }

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
