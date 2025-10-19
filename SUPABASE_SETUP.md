# Supabase Setup Guide for Vehicle SOC Dashboard

## Prerequisites
1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in Supabase

## Setup Steps

### 1. Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables
1. Open the `.env` file in the `main` directory
2. Replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 3. Run Database Migrations
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and run the SQL script

This will create:
- `vehicles` table - stores vehicle information and TEE status
- `alerts` table - stores security alerts
- `threat_metrics` table - stores historical threat data
- Necessary indexes and triggers
- Row Level Security policies
- Sample data for testing

### 4. Install Dependencies
```bash
cd VeSoc-Offsite/main
bun install @supabase/supabase-js
```

### 5. Start Development Server
```bash
bun run dev
```

## Database Schema

### Vehicles Table
- `id` (UUID, Primary Key)
- `vehicle_id` (Text, Unique) - e.g., "VH-2847"
- `model` (Text) - Vehicle model
- `location` (Text) - Current location
- `tee_status` (Enum: secure, warning, critical) - Overall TEE health
- `tee_total`, `tee_secure`, `tee_warning`, `tee_critical` (Integers) - TEE counts
- `last_update`, `created_at`, `updated_at` (Timestamps)

### Alerts Table
- `id` (UUID, Primary Key)
- `alert_id` (Text, Unique) - e.g., "ALT-001"
- `severity` (Enum: high, medium, low, benign) - Alert severity level
- `title` (Text) - Alert title
- `description` (Text) - Detailed description
- `vehicle_id` (Text) - Associated vehicle
- `tee_id` (Text) - TEE component ID
- `status` (Enum: pending, investigating, resolved) - Alert status
- `timestamp`, `created_at`, `updated_at` (Timestamps)

### Threat Metrics Table
- `id` (UUID, Primary Key)
- `timestamp` (Timestamp) - Metric collection time
- `critical_count`, `warning_count`, `info_count` (Integers) - Threat counts
- `created_at` (Timestamp)

## React Query Hooks

The following hooks are available in `src/hooks/api/`:

### Vehicles (`useVehicles.ts`)
```typescript
import { useVehicles, useVehicle, useUpdateVehicle } from '@/hooks/api/useVehicles'

// Fetch all vehicles
const { data: vehicles, isLoading } = useVehicles()

// Fetch single vehicle
const { data: vehicle } = useVehicle('VH-2847')

// Update vehicle
const updateVehicle = useUpdateVehicle()
updateVehicle.mutate({ id: 'uuid', tee_status: 'secure' })
```

### Alerts (`useAlerts.ts`)
```typescript
import { 
  useAlerts, 
  useAlert, 
  useAlertsByStatus, 
  useAlertsBySeverity,
  useUpdateAlert 
} from '@/hooks/api/useAlerts'

// Fetch all alerts
const { data: alerts } = useAlerts()

// Filter by status
const { data: pendingAlerts } = useAlertsByStatus('pending')

// Filter by severity
const { data: highAlerts } = useAlertsBySeverity('high')

// Update alert
const updateAlert = useUpdateAlert()
updateAlert.mutate({ id: 'uuid', status: 'resolved' })
```

### Threat Metrics (`useThreatMetrics.ts`)
```typescript
import { useThreatMetrics } from '@/hooks/api/useThreatMetrics'

// Fetch last 24 hours of metrics
const { data: metrics } = useThreatMetrics(24)
```

## Example: Updating Components to Use Real Data

### Before (Mock Data):
```typescript
const mockAlerts = [
  { id: "ALT-001", severity: "high", ... }
]
```

### After (Supabase Data):
```typescript
import { useAlerts } from '@/hooks/api/useAlerts'

export const AlertsGrid = () => {
  const { data: alerts, isLoading, error } = useAlerts()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading alerts</div>
  
  return (
    <div>
      {alerts?.map((alert) => (
        <div key={alert.id}>...</div>
      ))}
    </div>
  )
}
```

## Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- Current policies allow **public read access** for development
- For production:
  - Implement Supabase Auth for user authentication
  - Update RLS policies to restrict access based on user roles
  - Add write policies for authenticated users only

## Real-time Subscriptions (Optional)

To add real-time updates for live dashboard data:

```typescript
import { supabase } from '@/lib/supabase'

// Subscribe to new alerts
useEffect(() => {
  const channel = supabase
    .channel('alerts')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'alerts' },
      (payload) => {
        console.log('New alert:', payload.new)
        // Update your state/UI
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

## Troubleshooting

### Connection Issues
- Verify `.env` file has correct credentials (no quotes needed)
- Ensure Supabase project is active and not paused
- Check that API key has correct permissions in Supabase dashboard

### Migration Issues
- Ensure SQL script runs without errors in SQL Editor
- Check Supabase logs in dashboard for error details
- Verify tables are created in **Table Editor** section

### CORS Issues
- Supabase automatically handles CORS for your domain
- If issues persist, check project settings in Supabase dashboard

## Next Steps

1. ✅ **Update Components**: Replace mock data with Supabase hooks
2. ✅ **Add Authentication**: Implement Supabase Auth for user login
3. ✅ **Real-time Updates**: Add subscriptions for live dashboard updates
4. ✅ **Adjust RLS Policies**: Configure proper security policies for production
5. ✅ **Add API Routes**: Create server functions for complex operations
6. ✅ **Deploy**: Configure environment variables in your hosting platform

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
