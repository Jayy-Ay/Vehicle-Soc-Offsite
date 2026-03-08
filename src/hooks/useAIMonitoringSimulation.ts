import { useEffect, useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";

type Severity = "critical" | "high" | "medium";
type AnomalyStatus = "triaging" | "contained" | "mitigated";

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  source: string;
  vector: string;
  severity: Severity;
  confidence: number;
  description: string;
  remediation: string;
  status: AnomalyStatus;
}

export interface ModelUpdate {
  id: string;
  timestamp: string;
  version: string;
  triggeredBy: string;
  durationSeconds: number;
  summary: string;
  deltas: {
    label: string;
    from: number;
    to: number;
  }[];
}

export interface WeightSnapshot {
  timestamp: string;
  version: string;
  anomalySensitivity: number;
  driftTolerance: number;
  adversarialResilience: number;
  signalTrust: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const anomalyTemplates: Omit<AnomalyEvent, "id" | "timestamp" | "status">[] = [
  {
    source: "Vehicle-24 | CAN Bus",
    vector: "Spoofed braking frames with jitter",
    severity: "critical",
    confidence: 0.91,
    description: "Detected burst of forged CAN frames attempting to override braking priority and disable collision assists.",
    remediation: "Isolated bus segment, replay-protected frames, and raised braking override threshold until validation completes.",
  },
  {
    source: "Vehicle-08 | OTA",
    vector: "Unusual firmware delta",
    severity: "high",
    confidence: 0.82,
    description: "Unsigned OTA delta attempted to modify sensor fusion parameters outside normal deployment window.",
    remediation: "OTA channel locked, device certificates revalidated, and rollout paused pending manual approval.",
  },
  {
    source: "Vehicle-17 | TEE",
    vector: "Side-channel timing drift",
    severity: "medium",
    confidence: 0.74,
    description: "TEE enclave exhibited timing drift consistent with cache probe, affecting anomaly classifier execution.",
    remediation: "Rotated enclave keys, refreshed TEE policy, and re-routed inference to redundant enclave cluster.",
  },
  {
    source: "Fleet Edge | Gateway",
    vector: "Coordinated packet flood",
    severity: "high",
    confidence: 0.88,
    description: "Gateway observed bursty payloads mimicking telemetry to exhaust IDS windowing and hide malicious frames.",
    remediation: "Applied adaptive rate limiting, enabled deeper packet inspection, and mirrored traffic to sandbox.",
  },
];

const initialWeights: WeightSnapshot[] = [
  {
    timestamp: format(Date.now() - 20 * 60 * 1000, "HH:mm:ss"),
    version: "v1.14.1",
    anomalySensitivity: 0.62,
    driftTolerance: 0.24,
    adversarialResilience: 0.68,
    signalTrust: 0.71,
  },
  {
    timestamp: format(Date.now() - 10 * 60 * 1000, "HH:mm:ss"),
    version: "v1.14.3",
    anomalySensitivity: 0.67,
    driftTolerance: 0.21,
    adversarialResilience: 0.72,
    signalTrust: 0.74,
  },
  {
    timestamp: format(Date.now() - 5 * 60 * 1000, "HH:mm:ss"),
    version: "v1.14.4",
    anomalySensitivity: 0.7,
    driftTolerance: 0.18,
    adversarialResilience: 0.77,
    signalTrust: 0.79,
  },
];

const initialUpdates: ModelUpdate[] = [
  {
    id: "UP-1841",
    timestamp: format(Date.now() - 12 * 60 * 1000, "HH:mm:ss"),
    version: "v1.14.2",
    triggeredBy: "AN-1208",
    durationSeconds: 26,
    summary: "Reweighted adversarial detector after spiky OTA signature patterns.",
    deltas: [
      { label: "Adversarial resilience", from: 0.68, to: 0.72 },
      { label: "Signal trust", from: 0.71, to: 0.74 },
    ],
  },
  {
    id: "UP-1844",
    timestamp: format(Date.now() - 6 * 60 * 1000, "HH:mm:ss"),
    version: "v1.14.4",
    triggeredBy: "AN-1211",
    durationSeconds: 31,
    summary: "Tightened anomaly sensitivity for spoofed braking frames; reduced drift tolerance.",
    deltas: [
      { label: "Anomaly sensitivity", from: 0.67, to: 0.7 },
      { label: "Drift tolerance", from: 0.21, to: 0.18 },
    ],
  },
];

const initialAnomalies: AnomalyEvent[] = [
  {
    id: "AN-1208",
    timestamp: format(Date.now() - 15 * 60 * 1000, "HH:mm:ss"),
    source: "Vehicle-08 | OTA",
    vector: "Unsigned firmware delta",
    severity: "high",
    confidence: 0.82,
    description: "OTA channel delivered unsigned delta during restricted maintenance window.",
    remediation: "Rollback staged firmware and re-issue signed packages.",
    status: "mitigated",
  },
  {
    id: "AN-1211",
    timestamp: format(Date.now() - 7 * 60 * 1000, "HH:mm:ss"),
    source: "Vehicle-24 | CAN Bus",
    vector: "Forged braking frames",
    severity: "critical",
    confidence: 0.91,
    description: "Burst of spoofed braking frames attempted to override ABS arbitration.",
    remediation: "Segmented CAN, enforced replay protection, raised override threshold.",
    status: "contained",
  },
  {
    id: "AN-1212",
    timestamp: format(Date.now() - 3 * 60 * 1000, "HH:mm:ss"),
    source: "Fleet Edge | Gateway",
    vector: "Payload flood",
    severity: "high",
    confidence: 0.88,
    description: "Telemetry-mimicking payloads aimed to exhaust IDS windows and hide malicious frames.",
    remediation: "Applied adaptive rate limits and mirrored traffic to sandboxed IDS.",
    status: "triaging",
  },
];

const bumpVersion = (version: string) => {
  const parts = version.replace("v", "").split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return "v1.14.0";
  }

  parts[2] += 1;
  return `v${parts.join(".")}`;
};

const pickTemplate = () => {
  const template = anomalyTemplates[Math.floor(Math.random() * anomalyTemplates.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const status: AnomalyStatus = ["triaging", "contained", "mitigated"][
    Math.floor(Math.random() * 3)
  ] as AnomalyStatus;

  return {
    id: `AN-${suffix}`,
    timestamp: format(new Date(), "HH:mm:ss"),
    status,
    ...template,
  };
};

const deriveWeights = (current: WeightSnapshot, severity: Severity) => {
  const delta = severity === "critical" ? 0.04 : severity === "high" ? 0.025 : 0.015;
  const sensitivity = clamp(current.anomalySensitivity + delta, 0.45, 0.9);
  const driftTolerance = clamp(current.driftTolerance - delta / 2, 0.08, 0.35);
  const adversarialResilience = clamp(current.adversarialResilience + delta / 1.5, 0.55, 0.95);
  const signalTrust = clamp(current.signalTrust + delta / 2, 0.5, 0.9);

  return {
    sensitivity,
    driftTolerance,
    adversarialResilience,
    signalTrust,
  };
};

export function useAIMonitoringSimulation() {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(initialAnomalies);
  const [updates, setUpdates] = useState<ModelUpdate[]>(initialUpdates);
  const [weights, setWeights] = useState<WeightSnapshot[]>(initialWeights);
  const [activeRun, setActiveRun] = useState(false);

  const latestWeights = useMemo(() => weights[0] ?? initialWeights[initialWeights.length - 1], [weights]);
  const lastAnomaly = anomalies[0];

  useEffect(() => {
    setActiveRun(true);
    const interval = setInterval(() => {
      const anomaly = pickTemplate();

      setAnomalies((prev) => [anomaly, ...prev].slice(0, 12));
      toast(`Anomaly detected: ${anomaly.vector}`, {
        description: `${anomaly.source} • ${anomaly.severity.toUpperCase()} • ${anomaly.timestamp}`,
        position: "bottom-right",
        className: "border-destructive/50",
        duration: 5500,
      });

      setTimeout(() => {
        let baseWeights: WeightSnapshot | null = null;
        let snapshot: WeightSnapshot | null = null;

        setWeights((prev) => {
          const current = prev[0] ?? initialWeights[initialWeights.length - 1];
          baseWeights = current;
          const derived = deriveWeights(current, anomaly.severity);
          const nextVersion = bumpVersion(current.version);
          snapshot = {
            timestamp: format(new Date(), "HH:mm:ss"),
            version: nextVersion,
            anomalySensitivity: derived.sensitivity,
            driftTolerance: derived.driftTolerance,
            adversarialResilience: derived.adversarialResilience,
            signalTrust: derived.signalTrust,
          };
          return [snapshot, ...prev].slice(0, 15);
        });

        setUpdates((prev) => {
          const current = baseWeights ?? weights[0] ?? initialWeights[initialWeights.length - 1];
          const derived = snapshot;

          if (!derived) {
            return prev;
          }

          const update: ModelUpdate = {
            id: `UP-${Math.floor(1800 + Math.random() * 200).toString()}`,
            timestamp: format(new Date(), "HH:mm:ss"),
            version: derived.version,
            triggeredBy: anomaly.id,
            durationSeconds: Math.floor(22 + Math.random() * 12),
            summary:
              anomaly.severity === "critical"
                ? "Fast retrain on critical signal to reduce false negatives and tighten drift guardrails."
                : "Incremental weight tune applied from anomaly feedback loop.",
            deltas: [
              {
                label: "Anomaly sensitivity",
                from: current.anomalySensitivity,
                to: derived.anomalySensitivity,
              },
              {
                label: "Drift tolerance",
                from: current.driftTolerance,
                to: derived.driftTolerance,
              },
              {
                label: "Adversarial resilience",
                from: current.adversarialResilience,
                to: derived.adversarialResilience,
              },
              {
                label: "Signal trust",
                from: current.signalTrust,
                to: derived.signalTrust,
              },
            ],
          };
          return [update, ...prev].slice(0, 10);
        });
      }, 1800 + Math.random() * 1200);
    }, 9000);

    return () => {
      clearInterval(interval);
      setActiveRun(false);
    };
  }, []);

  return {
    anomalies,
    updates,
    weights,
    latestWeights,
    lastAnomaly,
    activeRun,
  };
}
