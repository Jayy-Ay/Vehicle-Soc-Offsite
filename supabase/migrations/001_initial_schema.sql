-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  location TEXT NOT NULL,
  tee_status TEXT NOT NULL CHECK (tee_status IN ('secure', 'warning', 'critical')),
  tee_total INTEGER NOT NULL DEFAULT 0,
  tee_secure INTEGER NOT NULL DEFAULT 0,
  tee_warning INTEGER NOT NULL DEFAULT 0,
  tee_critical INTEGER NOT NULL DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id TEXT UNIQUE NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low', 'benign')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  tee_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'investigating', 'resolved')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create threat_metrics table
CREATE TABLE IF NOT EXISTS threat_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  critical_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  info_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_id ON vehicles(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_tee_status ON vehicles(tee_status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_id ON alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_threat_metrics_timestamp ON threat_metrics(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your security needs)
CREATE POLICY "Enable read access for all users" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON alerts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON threat_metrics FOR SELECT USING (true);

-- Insert sample data for vehicles
INSERT INTO vehicles (vehicle_id, model, location, tee_status, tee_total, tee_secure, tee_warning, tee_critical, last_update)
VALUES 
  ('VH-2847', 'Model S-2024', 'San Francisco, CA', 'critical', 8, 6, 1, 1, NOW() - INTERVAL '2 minutes'),
  ('VH-1923', 'Model X-2023', 'Los Angeles, CA', 'warning', 12, 10, 2, 0, NOW() - INTERVAL '5 minutes'),
  ('VH-3456', 'Model 3-2024', 'Seattle, WA', 'critical', 6, 4, 1, 1, NOW() - INTERVAL '8 minutes'),
  ('VH-7890', 'Model Y-2023', 'Denver, CO', 'secure', 10, 10, 0, 0, NOW() - INTERVAL '12 minutes'),
  ('VH-4521', 'Model S-2023', 'Austin, TX', 'warning', 8, 7, 1, 0, NOW() - INTERVAL '15 minutes'),
  ('VH-9876', 'Model 3-2024', 'Miami, FL', 'secure', 12, 12, 0, 0, NOW() - INTERVAL '18 minutes')
ON CONFLICT (vehicle_id) DO NOTHING;

-- Insert sample data for alerts
INSERT INTO alerts (alert_id, severity, title, description, vehicle_id, tee_id, status, timestamp)
VALUES 
  ('ALT-001', 'high', 'Unauthorized Memory Access Detected', 'TEE integrity violation in vehicle ECU module', 'VH-2847', 'TEE-ECU-01', 'pending', NOW() - INTERVAL '2 minutes'),
  ('ALT-002', 'low', 'Anomalous Network Traffic', 'Unusual communication pattern from infotainment system', 'VH-1923', 'TEE-INFO-02', 'investigating', NOW() - INTERVAL '5 minutes'),
  ('ALT-003', 'high', 'TEE Boot Sequence Anomaly', 'Secure boot verification failed during startup', 'VH-3456', 'TEE-BOOT-01', 'pending', NOW() - INTERVAL '8 minutes'),
  ('ALT-004', 'benign', 'Security Update Available', 'New firmware available for TEE security module', 'VH-7890', 'TEE-SEC-05', 'resolved', NOW() - INTERVAL '12 minutes'),
  ('ALT-005', 'low', 'Suspicious Code Execution', 'Unexpected process activity in secure environment', 'VH-4521', 'TEE-PROC-03', 'investigating', NOW() - INTERVAL '15 minutes')
ON CONFLICT (alert_id) DO NOTHING;

-- Insert sample data for threat metrics (last 24 hours)
INSERT INTO threat_metrics (timestamp, critical_count, warning_count, info_count)
SELECT 
  NOW() - (interval '2 hours' * generate_series),
  floor(random() * 5 + 1)::int,
  floor(random() * 15 + 5)::int,
  floor(random() * 20 + 10)::int
FROM generate_series(0, 11)
ON CONFLICT DO NOTHING;
