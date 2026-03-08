import type { Database } from './database.types'

type Vehicle = Database['public']['Tables']['vehicles']['Row']
type Alert = Database['public']['Tables']['alerts']['Row']
type ThreatMetric = Database['public']['Tables']['threat_metrics']['Row']

const isoMinutesAgo = (minutes: number) => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutes)
  return date.toISOString()
}

export const demoVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    vehicle_id: 'VH-2847',
    model: 'Aurora X1',
    location: 'Munich, DE',
    tee_status: 'secure',
    tee_total: 24,
    tee_secure: 22,
    tee_warning: 1,
    tee_critical: 1,
    last_update: isoMinutesAgo(5),
    created_at: isoMinutesAgo(1440),
    updated_at: isoMinutesAgo(5),
  },
  {
    id: 'veh-2',
    vehicle_id: 'VH-1923',
    model: 'Sentinel Pro',
    location: 'Austin, US',
    tee_status: 'warning',
    tee_total: 18,
    tee_secure: 15,
    tee_warning: 2,
    tee_critical: 1,
    last_update: isoMinutesAgo(12),
    created_at: isoMinutesAgo(2880),
    updated_at: isoMinutesAgo(12),
  },
  {
    id: 'veh-3',
    vehicle_id: 'VH-3456',
    model: 'Eclipse GT',
    location: 'Nagoya, JP',
    tee_status: 'critical',
    tee_total: 20,
    tee_secure: 14,
    tee_warning: 3,
    tee_critical: 3,
    last_update: isoMinutesAgo(30),
    created_at: isoMinutesAgo(4320),
    updated_at: isoMinutesAgo(30),
  },
  {
    id: 'veh-4',
    vehicle_id: 'VH-7890',
    model: 'Vertex Q',
    location: 'Gothenburg, SE',
    tee_status: 'secure',
    tee_total: 26,
    tee_secure: 25,
    tee_warning: 1,
    tee_critical: 0,
    last_update: isoMinutesAgo(8),
    created_at: isoMinutesAgo(720),
    updated_at: isoMinutesAgo(8),
  },
  {
    id: 'veh-5',
    vehicle_id: 'VH-4521',
    model: 'Helix S',
    location: 'Detroit, US',
    tee_status: 'warning',
    tee_total: 16,
    tee_secure: 12,
    tee_warning: 3,
    tee_critical: 1,
    last_update: isoMinutesAgo(18),
    created_at: isoMinutesAgo(1440),
    updated_at: isoMinutesAgo(18),
  },
]

export const demoAlerts: Alert[] = [
  {
    id: 'alt-001',
    alert_id: 'ALT-001',
    severity: 'high',
    title: 'Unauthorized Memory Access Detected',
    description: 'TEE integrity violation detected on ECU module',
    vehicle_id: 'VH-2847',
    tee_id: 'TEE-ECU-01',
    status: 'pending',
    timestamp: isoMinutesAgo(2),
    created_at: isoMinutesAgo(2),
    updated_at: isoMinutesAgo(2),
  },
  {
    id: 'alt-002',
    alert_id: 'ALT-002',
    severity: 'medium',
    title: 'Anomalous Network Traffic',
    description: 'Unexpected outbound traffic detected from infotainment domain',
    vehicle_id: 'VH-1923',
    tee_id: 'TEE-INF-02',
    status: 'investigating',
    timestamp: isoMinutesAgo(7),
    created_at: isoMinutesAgo(7),
    updated_at: isoMinutesAgo(7),
  },
  {
    id: 'alt-003',
    alert_id: 'ALT-003',
    severity: 'high',
    title: 'TEE Boot Sequence Anomaly',
    description: 'Secure boot verification failed during startup',
    vehicle_id: 'VH-3456',
    tee_id: 'TEE-BOOT-01',
    status: 'pending',
    timestamp: isoMinutesAgo(11),
    created_at: isoMinutesAgo(11),
    updated_at: isoMinutesAgo(11),
  },
  {
    id: 'alt-004',
    alert_id: 'ALT-004',
    severity: 'low',
    title: 'Security Update Available',
    description: 'New firmware available for TEE security module',
    vehicle_id: 'VH-7890',
    tee_id: 'TEE-SEC-05',
    status: 'resolved',
    timestamp: isoMinutesAgo(18),
    created_at: isoMinutesAgo(18),
    updated_at: isoMinutesAgo(18),
  },
  {
    id: 'alt-005',
    alert_id: 'ALT-005',
    severity: 'medium',
    title: 'Suspicious Code Execution',
    description: 'Unexpected process activity in secure environment',
    vehicle_id: 'VH-4521',
    tee_id: 'TEE-PROC-03',
    status: 'investigating',
    timestamp: isoMinutesAgo(26),
    created_at: isoMinutesAgo(26),
    updated_at: isoMinutesAgo(26),
  },
]

export const demoThreatMetrics: ThreatMetric[] = Array.from({ length: 24 }).map((_, idx) => {
  const hoursAgo = 23 - idx
  const date = new Date()
  date.setHours(date.getHours() - hoursAgo)

  return {
    id: `tm-${idx}`,
    timestamp: date.toISOString(),
    critical_count: Math.max(0, 6 - Math.floor(hoursAgo / 4)),
    warning_count: 10 + (idx % 4),
    info_count: 18 + (idx % 6),
    created_at: date.toISOString(),
  }
})
