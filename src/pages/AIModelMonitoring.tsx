import React, { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useAIMonitoringSimulation } from "@/hooks/useAIMonitoringSimulation";
import {
  ActivitySquare,
  AlertTriangle,
  Brain,
  ChartLine,
  Clock3,
  Layers,
  ShieldCheck,
  Sparkles,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export default function AIModelMonitoring() {
  const { anomalies, updates, weights, latestWeights, lastAnomaly, activeRun } =
    useAIMonitoringSimulation();
  const [query, setQuery] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const anomalyIndex = useMemo(
    () => new Map(anomalies.map((anomaly) => [anomaly.id, anomaly])),
    [anomalies],
  );

  const chartData = [...weights]
    .slice(0, 15)
    .reverse()
    .map((w) => ({
      time: w.timestamp,
      sensitivity: Number((w.anomalySensitivity * 100).toFixed(1)),
      driftTolerance: Number((w.driftTolerance * 100).toFixed(1)),
      adversarialResilience: Number((w.adversarialResilience * 100).toFixed(1)),
      signalTrust: Number((w.signalTrust * 100).toFixed(1)),
    }));

  const filteredUpdates = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return updates;

    return updates.filter((update) => {
      const anomaly = anomalyIndex.get(update.triggeredBy);
      const haystack = [
        update.summary,
        update.version,
        update.triggeredBy,
        anomaly?.vector,
        anomaly?.severity,
        anomaly?.description,
        ...update.deltas.map((d) => `${d.label} ${d.from} ${d.to}`),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [anomalyIndex, query, updates]);

  const updateMarkers = filteredUpdates.slice(0, 4).map((update) => {
    const primaryDelta = update.deltas[0];
    return {
      time: update.timestamp,
      value: primaryDelta ? Number((primaryDelta.to * 100).toFixed(1)) : undefined,
      label: update.version,
    };
  });

  const graphNodes = useMemo(() => {
    const nodes = filteredUpdates.slice(0, 6).map((update, index) => {
      const anomaly = anomalyIndex.get(update.triggeredBy);
      return {
        id: update.id,
        label: update.version,
        detail: anomaly?.vector ?? update.summary,
        severity: anomaly?.severity ?? "medium",
        type: "update" as const,
        index,
      };
    });

    const anomalyNodes = anomalies.slice(0, 6).map((anomaly, index) => ({
      id: anomaly.id,
      label: anomaly.vector,
      detail: anomaly.description,
      severity: anomaly.severity,
      type: "anomaly" as const,
      index,
    }));

    return [...nodes, ...anomalyNodes];
  }, [anomalies, anomalyIndex, filteredUpdates]);

  const graphEdges = useMemo(() => {
    return filteredUpdates.slice(0, 6).map((update, index) => ({
      id: `${update.id}-edge`,
      from: update.id,
      to: update.triggeredBy,
      weight: 0.7 + (index % 3) * 0.1,
    }));
  }, [filteredUpdates]);

  return (
    <AppLayout>
      <div className="space-y-6 pb-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-left">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">AI Model Monitoring &amp; Response</h1>
            </div>
            <p className="text-muted-foreground">
              Mock real-time dashboard showing anomaly-triggered retraining, weight adjustments, and auto-hardening
              of the detection model.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Version {latestWeights.version}</Badge>
            <Badge variant={activeRun ? "default" : "outline"} className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Retrain loop {activeRun ? "armed" : "idle"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-surface border-border shadow-soc transition hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Model posture</CardTitle>
              <ShieldCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatPercent(latestWeights.adversarialResilience)}
              </div>
              <p className="text-xs text-muted-foreground">Adversarial resilience</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc transition hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomaly sensitivity</CardTitle>
              <ActivitySquare className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatPercent(latestWeights.anomalySensitivity)}
              </div>
              <p className="text-xs text-muted-foreground">Detection threshold</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc transition hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drift tolerance</CardTitle>
              <ChartLine className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(latestWeights.driftTolerance)}</div>
              <p className="text-xs text-muted-foreground">Adaptive windowing</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc transition hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest anomaly</CardTitle>
              <AlertTriangle className="h-4 w-4 text-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{lastAnomaly?.vector ?? "Stable"}</div>
              <p className="text-xs text-muted-foreground">
                {lastAnomaly ? `${lastAnomaly.severity.toUpperCase()} • ${lastAnomaly.timestamp}` : "Monitoring baseline"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-xl">Weight trajectories</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    Sensitivity
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    Drift
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Resilience
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    Trust
                  </div>
                </div>
              </div>
              <CardDescription>
                Mock weight deltas applied after each anomaly replay to harden the detection model.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 8, right: 12, bottom: 8 }}>
                  <defs>
                    <linearGradient id="sens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(25 95% 53%)" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="hsl(25 95% 53%)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="drift" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="adv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="trust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(280 72% 60%)" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="hsl(280 72% 60%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 20%)" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(215 20% 65%)"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    minTickGap={0}
                    tickMargin={8}
                    angle={-35}
                    textAnchor="end"
                    height={56}
                    tickFormatter={(value) => String(value).slice(3)}
                  />
                  <YAxis
                    stroke="hsl(215 20% 65%)"
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      background: "hsl(240 10% 6%)",
                      borderColor: "hsl(220 15% 20%)",
                      borderRadius: 12,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 8 }} />
                  <Area
                    type="monotone"
                    dataKey="sensitivity"
                    stroke="hsl(25 95% 53%)"
                    fill="url(#sens)"
                    strokeWidth={2.2}
                    name="Anomaly sensitivity"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(25 95% 53%)" }}
                    isAnimationActive
                  />
                  <Area
                    type="monotone"
                    dataKey="driftTolerance"
                    stroke="hsl(217 91% 60%)"
                    fill="url(#drift)"
                    strokeWidth={2.2}
                    name="Drift tolerance"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(217 91% 60%)" }}
                    isAnimationActive
                  />
                  <Area
                    type="monotone"
                    dataKey="adversarialResilience"
                    stroke="hsl(142 76% 36%)"
                    fill="url(#adv)"
                    strokeWidth={2.2}
                    name="Adversarial resilience"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(142 76% 36%)" }}
                    isAnimationActive
                  />
                  <Area
                    type="monotone"
                    dataKey="signalTrust"
                    stroke="hsl(280 72% 60%)"
                    fill="url(#trust)"
                    strokeWidth={2.2}
                    name="Signal trust"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(280 72% 60%)" }}
                    isAnimationActive
                  />
                  {updateMarkers
                    .filter((marker) => marker.value !== undefined)
                    .map((marker) => (
                      <ReferenceDot
                        key={marker.label}
                        x={marker.time}
                        y={marker.value}
                        r={5}
                        fill="hsl(142 76% 36%)"
                        stroke="hsl(142 76% 26%)"
                        ifOverflow="extendDomain"
                        label={{
                          position: "top",
                          value: marker.label,
                          fill: "hsl(217 33% 90%)",
                          fontSize: 10,
                        }}
                      />
                    ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-xl">Retraining loop</CardTitle>
                <Badge variant="outline" className="text-[11px]">Autonomous</Badge>
              </div>
              <CardDescription>Mocked job tracker for anomaly-triggered updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <span>Retraining window</span>
                </div>
                <Badge variant="outline">~35s runtime</Badge>
              </div>
              <Progress value={78} className="h-2" />
              <div className="rounded-lg border border-border bg-background/60 p-3 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Latest trigger</span>
                  <Badge variant="secondary">{updates[0]?.triggeredBy ?? "Pending"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Applied version</span>
                  <span className="font-medium">{updates[0]?.version ?? latestWeights.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Job status</span>
                  <span className="text-success">Ready • streaming weights</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              The loop replays anomalous sequences, recalculates thresholds, and saves a versioned snapshot for rollback.
            </CardFooter>
          </Card>
        </div>

        {/* <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">Signal relationship graph</CardTitle>
              <CardDescription>
                Connected view of anomalies and their resulting model updates with live emphasis and hover states.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-border bg-background/50 p-4">
              <svg viewBox="0 0 220 220" className="h-[280px] w-full">
                <defs>
                  <radialGradient id="nodeGlow" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="hsl(217 91% 60%)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="220" height="220" rx="14" fill="url(#nodeGlow)" opacity="0.35" />
                {graphEdges.map((edge) => {
                  const from = graphNodes.find((n) => n.id === edge.from);
                  const to = graphNodes.find((n) => n.id === edge.to);
                  if (!from || !to) return null;

                  const total = graphNodes.length || 1;
                  const angleFrom = (from.index / total) * Math.PI * 2;
                  const angleTo = (to.index / total) * Math.PI * 2;
                  const radius = 80;
                  const cx = 110;
                  const cy = 110;
                  const x1 = cx + radius * Math.cos(angleFrom);
                  const y1 = cy + radius * Math.sin(angleFrom);
                  const x2 = cx + radius * Math.cos(angleTo);
                  const y2 = cy + radius * Math.sin(angleTo);

                  return (
                    <g key={edge.id} className="transition-all duration-300">
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="hsl(217 25% 65%)"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        opacity={0.7}
                      />
                    </g>
                  );
                })}
                {graphNodes.map((node) => {
                  const total = graphNodes.length || 1;
                  const angle = (node.index / total) * Math.PI * 2;
                  const radius = 80;
                  const cx = 110;
                  const cy = 110;
                  const x = cx + radius * Math.cos(angle);
                  const y = cy + radius * Math.sin(angle);
                  const isActive =
                    selectedNode === node.id ||
                    (!selectedNode && query && node.detail.toLowerCase().includes(query.toLowerCase()));

                  const color =
                    node.type === "update"
                      ? "hsl(142 76% 36%)"
                      : node.severity === "critical"
                        ? "hsl(0 84% 60%)"
                        : node.severity === "high"
                          ? "hsl(38 92% 50%)"
                          : "hsl(217 91% 60%)";

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setSelectedNode(node.id)}
                      onMouseLeave={() => setSelectedNode(null)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isActive ? 9 : 7}
                        fill={color}
                        opacity={0.9}
                        className="transition-all duration-200"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={isActive ? 16 : 12}
                        fill={color}
                        opacity={0.12}
                        className="transition-all duration-300"
                      />
                      <text
                        x={x}
                        y={y - 14}
                        textAnchor="middle"
                        fontSize="9"
                        fill="hsl(215 33% 92%)"
                        className="pointer-events-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-3 transition">
              {selectedNode ? (
                (() => {
                  const node = graphNodes.find((n) => n.id === selectedNode);
                  if (!node) return null;
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{node.label}</span>
                        <Badge variant="outline" className="capitalize">
                          {node.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{node.detail}</p>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Hover nodes to spotlight their relationship details and keep the graph feeling alive.
                </div>
              )}
            </div>
          </CardContent>
        </Card> */}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <CardTitle>Live anomaly stream</CardTitle>
                <Badge variant="destructive">Security feed</Badge>
              </div>
              <CardDescription>
                Incoming detections with severity, source, and suggested mitigation. All data is mocked for demo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="rounded-lg border border-border bg-background/60 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          anomaly.severity === "critical"
                            ? "destructive"
                            : anomaly.severity === "high"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{anomaly.vector}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{anomaly.timestamp}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{anomaly.description}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{anomaly.source}</span>
                    <span>Confidence {Math.round(anomaly.confidence * 100)}%</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{anomaly.remediation}</span>
                    <Badge variant="outline" className="capitalize">
                      {anomaly.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">Model update timeline</CardTitle>
                  <CardDescription>
                    Weight adjustments captured per anomaly replay with clear, versioned deltas.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  PRL - Rollback ready
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search updates, anomalies, versions..."
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredUpdates.length === 0 && (
                <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground text-center">
                  No updates match “{query}”. Try another keyword.
                </div>
              )}
              {filteredUpdates.map((update) => {
                const anomaly = anomalyIndex.get(update.triggeredBy);
                const isOpen = selectedUpdate === update.id;
                return (
                  <button
                    key={update.id}
                    onClick={() => setSelectedUpdate((prev) => (prev === update.id ? null : update.id))}
                    className={`w-full text-left rounded-lg border border-border bg-background/60 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 ${
                      isOpen ? "ring-2 ring-primary/60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{update.version}</Badge>
                        <span className="text-sm font-semibold">{update.summary}</span>
                        {anomaly?.severity && (
                          <Badge
                            variant={
                              anomaly.severity === "critical"
                                ? "destructive"
                                : anomaly.severity === "high"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="uppercase"
                          >
                            {anomaly.severity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{update.timestamp}</span>
                        <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : "rotate-0"}`} />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Triggered by {update.triggeredBy}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>Runtime {update.durationSeconds}s</span>
                      {anomaly?.vector && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="text-foreground">{anomaly.vector}</span>
                        </>
                      )}
                    </div>
                    {isOpen && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        {update.deltas.map((delta) => {
                          const direction = delta.to - delta.from >= 0 ? "up" : "down";
                          const color = direction === "up" ? "text-success" : "text-warning";
                          return (
                            <div
                              key={`${update.id}-${delta.label}`}
                              className="rounded-md border border-border/80 bg-background/70 p-2"
                            >
                              <div className="font-medium">{delta.label}</div>
                              <div className={`flex items-center gap-2 ${color}`}>
                                <span>
                                  {delta.from.toFixed(2)} → {delta.to.toFixed(2)}
                                </span>
                                {direction === "up" ? "▲" : "▼"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
