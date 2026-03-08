import { useSyncExternalStore } from "react";
import { format } from "date-fns";
import type { Database } from "@/lib/database.types";

type AlertRow = Database["public"]["Tables"]["alerts"]["Row"];
type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

export type GlobalAnomalySeverity = "critical" | "high" | "medium";
export type GlobalAnomalyStatus = "triaging" | "contained" | "mitigated";

export interface GlobalAnomalyEvent {
  id: string;
  timestamp: string;
  occurredAt: string;
  source: string;
  vector: string;
  severity: GlobalAnomalySeverity;
  confidence: number;
  description: string;
  remediation: string;
  status: GlobalAnomalyStatus;
}

const anomalyTemplates: Omit<
  GlobalAnomalyEvent,
  "id" | "timestamp" | "occurredAt" | "status"
>[] = [
  {
    source: "Vehicle-24 | CAN Bus",
    vector: "Spoofed braking frames with jitter",
    severity: "critical",
    confidence: 0.91,
    description:
      "Detected burst of forged CAN frames attempting to override braking priority and disable collision assists.",
    remediation:
      "Isolated bus segment, replay-protected frames, and raised braking override threshold until validation completes.",
  },
  {
    source: "Vehicle-08 | OTA",
    vector: "Unusual firmware delta",
    severity: "high",
    confidence: 0.82,
    description:
      "Unsigned OTA delta attempted to modify sensor fusion parameters outside normal deployment window.",
    remediation:
      "OTA channel locked, device certificates revalidated, and rollout paused pending manual approval.",
  },
  {
    source: "Vehicle-17 | TEE",
    vector: "Side-channel timing drift",
    severity: "medium",
    confidence: 0.74,
    description:
      "TEE enclave exhibited timing drift consistent with cache probe, affecting anomaly classifier execution.",
    remediation:
      "Rotated enclave keys, refreshed TEE policy, and re-routed inference to redundant enclave cluster.",
  },
  {
    source: "Fleet Edge | Gateway",
    vector: "Coordinated packet flood",
    severity: "high",
    confidence: 0.88,
    description:
      "Gateway observed bursty payloads mimicking telemetry to exhaust IDS windowing and hide malicious frames.",
    remediation:
      "Applied adaptive rate limiting, enabled deeper packet inspection, and mirrored traffic to sandbox.",
  },
];

const statusPool: GlobalAnomalyStatus[] = ["triaging", "contained", "mitigated"];

const buildEvent = (
  template: (typeof anomalyTemplates)[number],
  status: GlobalAnomalyStatus,
  offsetMs = 0,
): GlobalAnomalyEvent => {
  const now = new Date(Date.now() + offsetMs);
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return {
    id: `AN-${suffix}`,
    timestamp: format(now, "HH:mm:ss"),
    occurredAt: now.toISOString(),
    status,
    ...template,
  };
};

const seedAnomalies: GlobalAnomalyEvent[] = [
  buildEvent(anomalyTemplates[1], "mitigated", -15 * 60 * 1000),
  buildEvent(anomalyTemplates[0], "contained", -7 * 60 * 1000),
  buildEvent(anomalyTemplates[3], "triaging", -3 * 60 * 1000),
].reverse();

let anomalySnapshot: GlobalAnomalyEvent[] = seedAnomalies;
let streamActive = false;
let intervalHandle: number | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const pickRandomTemplate = () =>
  anomalyTemplates[Math.floor(Math.random() * anomalyTemplates.length)];

const pickRandomStatus = () =>
  statusPool[Math.floor(Math.random() * statusPool.length)];

const startStream = () => {
  if (streamActive || typeof window === "undefined") {
    return;
  }

  streamActive = true;
  intervalHandle = window.setInterval(() => {
    const next = buildEvent(pickRandomTemplate(), pickRandomStatus());
    anomalySnapshot = [next, ...anomalySnapshot].slice(0, 24);
    emit();
  }, 9000);

  emit();
};

const subscribe = (listener: () => void) => {
  startStream();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && intervalHandle) {
      window.clearInterval(intervalHandle);
      intervalHandle = null;
      streamActive = false;
    }
  };
};

const getSnapshot = () => anomalySnapshot;

const toAlertSeverity = (severity: GlobalAnomalySeverity): AlertRow["severity"] => {
  switch (severity) {
    case "critical":
      return "high";
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "low";
  }
};

const toAlertStatus = (status: GlobalAnomalyStatus): AlertRow["status"] => {
  switch (status) {
    case "triaging":
      return "pending";
    case "contained":
      return "investigating";
    case "mitigated":
      return "resolved";
  }
};

const toVehicleHint = (source: string) => {
  const match = source.match(/Vehicle-(\d+)/i);
  if (!match) {
    return "VH-EDGE";
  }

  return `VH-${match[1].padStart(4, "0")}`;
};

const anomalyToAlert = (anomaly: GlobalAnomalyEvent): AlertRow => ({
  id: `mock-${anomaly.id}`,
  alert_id: anomaly.id,
  severity: toAlertSeverity(anomaly.severity),
  title: anomaly.vector,
  description: anomaly.description,
  vehicle_id: toVehicleHint(anomaly.source),
  tee_id: anomaly.source,
  status: toAlertStatus(anomaly.status),
  timestamp: anomaly.occurredAt,
  created_at: anomaly.occurredAt,
  updated_at: anomaly.occurredAt,
});

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

const severityWeight: Record<GlobalAnomalySeverity, number> = {
  critical: 3,
  high: 2,
  medium: 1,
};

const statusWeight: Record<GlobalAnomalyStatus, number> = {
  triaging: 1,
  contained: 0.7,
  mitigated: 0.35,
};

export const mergeAlertsWithAnomalies = (
  baseAlerts: AlertRow[] | undefined,
  anomalies: GlobalAnomalyEvent[],
) => {
  const overlay = anomalies.slice(0, 12).map(anomalyToAlert);
  const overlayAlertIds = new Set(overlay.map((alert) => alert.alert_id));
  const merged = [
    ...overlay,
    ...(baseAlerts ?? []).filter((alert) => !overlayAlertIds.has(alert.alert_id)),
  ];

  return merged.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

export const mergeVehiclesWithAnomalies = (
  baseVehicles: VehicleRow[] | undefined,
  anomalies: GlobalAnomalyEvent[],
) => {
  if (!baseVehicles || baseVehicles.length === 0) {
    return baseVehicles ?? [];
  }

  if (anomalies.length === 0) {
    return baseVehicles;
  }

  const nextVehicles = baseVehicles.map((vehicle) => ({ ...vehicle }));

  for (const anomaly of anomalies.slice(0, 10)) {
    const vehicleIndex = hashString(anomaly.id) % nextVehicles.length;
    const vehicle = nextVehicles[vehicleIndex];
    const impact = Math.max(
      1,
      Math.round(severityWeight[anomaly.severity] * statusWeight[anomaly.status]),
    );

    const criticalDelta = anomaly.severity === "critical" ? Math.min(2, impact) : 0;
    const warningDelta = anomaly.severity === "critical" ? Math.max(1, impact - 1) : impact;

    const teeCritical = clampInt(
      vehicle.tee_critical + criticalDelta,
      0,
      vehicle.tee_total,
    );
    const warningCap = Math.max(0, vehicle.tee_total - teeCritical);
    const teeWarning = clampInt(vehicle.tee_warning + warningDelta, 0, warningCap);
    const teeSecure = Math.max(0, vehicle.tee_total - teeCritical - teeWarning);

    nextVehicles[vehicleIndex] = {
      ...vehicle,
      tee_critical: teeCritical,
      tee_warning: teeWarning,
      tee_secure: teeSecure,
      tee_status: teeCritical > 0 ? "critical" : teeWarning > 0 ? "warning" : "secure",
      last_update: anomaly.occurredAt,
      updated_at: anomaly.occurredAt,
    };
  }

  return nextVehicles.sort(
    (a, b) => new Date(b.last_update).getTime() - new Date(a.last_update).getTime(),
  );
};

export const useGlobalAnomalyStream = () => {
  const anomalies = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    anomalies,
    activeRun: streamActive,
  };
};
