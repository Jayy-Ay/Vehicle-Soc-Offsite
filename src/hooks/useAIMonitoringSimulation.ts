import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { type GlobalAnomalyEvent, useGlobalAnomalyStream } from "@/hooks/useGlobalAnomalyStream";

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

const randomSigned = (magnitude: number) => (Math.random() * 2 - 1) * magnitude;

const maybeSpike = (chance: number, magnitude: number) =>
  Math.random() < chance ? randomSigned(magnitude) : 0;

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

const bumpVersion = (version: string) => {
  const parts = version.replace("v", "").split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return "v1.14.0";
  }

  parts[2] += 1;
  return `v${parts.join(".")}`;
};

const deriveWeights = (current: WeightSnapshot, severity: Severity) => {
  // Inject turbulence and occasional spikes so trajectories look less linear in the demo.
  const baseVolatility = severity === "critical" ? 0.08 : severity === "high" ? 0.055 : 0.04;
  const spike = maybeSpike(
    severity === "critical" ? 0.5 : severity === "high" ? 0.35 : 0.2,
    baseVolatility * 1.8,
  );

  const sensitivity = clamp(
    current.anomalySensitivity + baseVolatility * 0.2 + randomSigned(baseVolatility) + spike * 0.5,
    0.4,
    0.95,
  );
  const driftTolerance = clamp(
    current.driftTolerance - baseVolatility * 0.18 + randomSigned(baseVolatility * 0.9) - spike * 0.45,
    0.05,
    0.45,
  );
  const adversarialResilience = clamp(
    current.adversarialResilience + baseVolatility * 0.15 + randomSigned(baseVolatility * 0.8) + spike * 0.35,
    0.5,
    0.98,
  );
  const signalTrust = clamp(
    current.signalTrust + randomSigned(baseVolatility) - spike * 0.25,
    0.42,
    0.94,
  );

  return {
    sensitivity,
    driftTolerance,
    adversarialResilience,
    signalTrust,
  };
};

const mapGlobalAnomaly = (event: GlobalAnomalyEvent): AnomalyEvent => ({
  id: event.id,
  timestamp: event.timestamp,
  source: event.source,
  vector: event.vector,
  severity: event.severity,
  confidence: event.confidence,
  description: event.description,
  remediation: event.remediation,
  status: event.status,
});

export function useAIMonitoringSimulation() {
  const { anomalies: streamAnomalies, activeRun } = useGlobalAnomalyStream();
  const anomalies = useMemo(
    () => streamAnomalies.slice(0, 12).map(mapGlobalAnomaly),
    [streamAnomalies],
  );
  const [updates, setUpdates] = useState<ModelUpdate[]>(initialUpdates);
  const [weights, setWeights] = useState<WeightSnapshot[]>(initialWeights);
  const lastProcessedAnomalyId = useRef<string | null>(streamAnomalies[0]?.id ?? null);

  const latestWeights = useMemo(() => weights[0] ?? initialWeights[initialWeights.length - 1], [weights]);
  const lastAnomaly = anomalies[0];

  useEffect(() => {
    const anomaly = anomalies[0];
    if (!anomaly) {
      return;
    }

    if (lastProcessedAnomalyId.current === anomaly.id) {
      return;
    }

    lastProcessedAnomalyId.current = anomaly.id;

    const timer = window.setTimeout(() => {
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

    return () => {
      window.clearTimeout(timer);
    };
  }, [anomalies, weights]);

  return {
    anomalies,
    updates,
    weights,
    latestWeights,
    lastAnomaly,
    activeRun,
  };
}
