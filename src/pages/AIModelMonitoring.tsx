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
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export default function AIModelMonitoring() {
  const { anomalies, updates, weights, latestWeights, lastAnomaly, activeRun } =
    useAIMonitoringSimulation();

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">
                AI Model Monitoring &amp; Response
              </h1>
            </div>
            <p className="text-muted-foreground">
              Mock real-time dashboard showing anomaly-triggered retraining, weight
              adjustments, and auto-hardening of the detection model.
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
          <Card className="bg-gradient-surface border-border shadow-soc">
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

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomaly sensitivity</CardTitle>
              <ActivitySquare className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(latestWeights.anomalySensitivity)}</div>
              <p className="text-xs text-muted-foreground">Detection threshold</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drift tolerance</CardTitle>
              <ChartLine className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(latestWeights.driftTolerance)}</div>
              <p className="text-xs text-muted-foreground">Adaptive windowing</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest anomaly</CardTitle>
              <AlertTriangle className="h-4 w-4 text-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{lastAnomaly?.vector ?? "Stable"}</div>
              <p className="text-xs text-muted-foreground">
                {lastAnomaly
                  ? `${lastAnomaly.severity.toUpperCase()} • ${lastAnomaly.timestamp}`
                  : "Monitoring baseline"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-col gap-1">
              <CardTitle>Weight trajectories</CardTitle>
              <CardDescription>
                Mock weight deltas applied after each anomaly replay to harden the detection model.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
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
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{ background: "hsl(240 10% 6%)", borderColor: "hsl(220 15% 20%)" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sensitivity"
                    stroke="hsl(25 95% 53%)"
                    fill="url(#sens)"
                    strokeWidth={2}
                    name="Anomaly sensitivity"
                  />
                  <Area
                    type="monotone"
                    dataKey="driftTolerance"
                    stroke="hsl(217 91% 60%)"
                    fill="url(#drift)"
                    strokeWidth={2}
                    name="Drift tolerance"
                  />
                  <Area
                    type="monotone"
                    dataKey="adversarialResilience"
                    stroke="hsl(142 76% 36%)"
                    fill="url(#adv)"
                    strokeWidth={2}
                    name="Adversarial resilience"
                  />
                  <Area
                    type="monotone"
                    dataKey="signalTrust"
                    stroke="hsl(280 72% 60%)"
                    fill="url(#trust)"
                    strokeWidth={2}
                    name="Signal trust"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="space-y-1">
              <CardTitle>Retraining loop</CardTitle>
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
                  className="rounded-lg border border-border bg-background/60 p-3 shadow-sm"
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
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle>Model update timeline</CardTitle>
                <Badge variant="outline" className="flex shrink-0 items-center gap-1">
                  <Layers className="h-4 w-4" />
                  PRL - Rollback ready
                </Badge>
              </div>
              <CardDescription>
                Weight adjustments captured per anomaly replay with clear, versioned deltas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="rounded-lg border border-border bg-background/60 p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{update.version}</Badge>
                      <span className="text-sm font-semibold">{update.summary}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{update.timestamp}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Triggered by {update.triggeredBy}</span>
                    <span>Runtime {update.durationSeconds}s</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {update.deltas.map((delta) => {
                      const direction = delta.to - delta.from >= 0 ? "up" : "down";
                      const color =
                        direction === "up"
                          ? "text-success"
                          : "text-warning";
                      return (
                        <div
                          key={`${update.id}-${delta.label}`}
                          className="rounded-md border border-border/80 bg-background/70 p-2"
                        >
                          <div className="font-medium">{delta.label}</div>
                          <div className={`flex items-center gap-2 ${color}`}>
                            <span>{delta.from.toFixed(2)} → {delta.to.toFixed(2)}</span>
                            {direction === "up" ? "▲" : "▼"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
