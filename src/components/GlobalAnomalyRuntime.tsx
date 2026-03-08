import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { useGlobalAnomalyStream } from "@/hooks/useGlobalAnomalyStream";

export function GlobalAnomalyRuntime() {
  const { anomalies } = useGlobalAnomalyStream();
  const lastNotifiedId = useRef<string | null>(anomalies[0]?.id ?? null);

  useEffect(() => {
    const latest = anomalies[0];
    if (!latest) {
      return;
    }

    if (lastNotifiedId.current === latest.id) {
      return;
    }

    lastNotifiedId.current = latest.id;
    toast(`Anomaly detected: ${latest.vector}`, {
      description: `${latest.source} • ${latest.severity.toUpperCase()} • ${latest.timestamp}`,
      position: "bottom-right",
      className: "border-destructive/50",
      duration: 5500,
    });
  }, [anomalies]);

  return null;
}
