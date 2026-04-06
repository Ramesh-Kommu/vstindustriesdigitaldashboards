import { useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProcessFilters from "@/components/ProcessFilters";
import { processData } from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, BarChart, Bar, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Droplets, Thermometer, Wind, BarChart3, TrendingUp, Download, Maximize2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

const calcStats = (values: number[], target: number, lsl: number, usl: number) => {
  const n = values.length;
  const avg = values.reduce((s, v) => s + v, 0) / n;
  const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / (n - 1));
  const pp = +((usl - lsl) / (6 * stdDev)).toFixed(3);
  const ppk = +(Math.min(usl - avg, avg - lsl) / (3 * stdDev)).toFixed(3);
  return { avg: +avg.toFixed(2), sigma: +stdDev.toFixed(3), pp, ppk, points: n };
};

const buildHistogramData = (values: number[], bins: number = 15) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins;
  const histogram = Array.from({ length: bins }, (_, i) => {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter((v) => v >= binStart && (i === bins - 1 ? v <= binEnd : v < binEnd)).length;
    return { range: +((binStart + binEnd) / 2).toFixed(2), count, binStart: +binStart.toFixed(2), binEnd: +binEnd.toFixed(2) };
  });
  return histogram;
};

interface ChartConfig {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  dataKey: string;
  lineColor: string;
  target: number;
  lsl: number;
  usl: number;
  lcl: number;
  ucl: number;
  unit: string;
  tagId: string;
  yDomain: [number, number];
}

const chartConfigs: ChartConfig[] = [
  { title: "Moisture Control Chart", icon: Droplets, iconColor: "text-chart-moisture", dataKey: "moisture", lineColor: "hsl(170, 70%, 45%)", target: 12.5, lsl: 11.0, usl: 14.0, lcl: 11.5, ucl: 13.5, unit: "%", tagId: "MC", yDomain: [10, 15] },
  { title: "Temperature Control Chart", icon: Thermometer, iconColor: "text-critical", dataKey: "temperature", lineColor: "hsl(0, 72%, 55%)", target: 31, lsl: 27, usl: 35, lcl: 28, ucl: 34, unit: "°C", tagId: "TC", yDomain: [25, 38] },
  { title: "Humidity Control Chart", icon: Wind, iconColor: "text-chart-humidity", dataKey: "humidity", lineColor: "hsl(290, 60%, 55%)", target: 58, lsl: 50, usl: 65, lcl: 52, ucl: 63, unit: "% RH", tagId: "HC", yDomain: [45, 70] },
];

interface SPCChartProps {
  config: ChartConfig;
  delay: number;
}

const SPCChart = ({ config, delay }: SPCChartProps) => {
  const [viewMode, setViewMode] = useState<"timeseries" | "histogram">("timeseries");
  const [showLimits, setShowLimits] = useState(true);
  const [showSPCRules, setShowSPCRules] = useState(true);
  const [xAxisMode, setXAxisMode] = useState<"sample" | "time">("time");

  const values = processData.map((d) => d[config.dataKey as keyof typeof d] as number);
  const stats = useMemo(() => calcStats(values, config.target, config.lsl, config.usl), []);
  const histogramData = useMemo(() => buildHistogramData(values), []);

  const handleDownload = useCallback(() => {
    const csv = ["Timestamp,Sample,Value", ...processData.map((d, i) => `${d.timestamp},${d.time},${d[config.dataKey as keyof typeof d]}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.dataKey}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config.dataKey]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const point = payload[0];
    const dataPoint = processData.find((d) => (xAxisMode === "time" ? format(new Date(d.timestamp), "HH:mm") : d.time) === label);
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="text-muted-foreground text-xs mb-1">
          {dataPoint ? format(new Date(dataPoint.timestamp), "dd MMM yyyy, HH:mm") : label}
        </p>
        <p className="font-semibold text-foreground">
          {config.title.split(" ")[0]}: <span className="mono">{point.value} {config.unit}</span>
        </p>
      </div>
    );
  };

  const HistogramTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="text-muted-foreground text-xs mb-1">Range: {d.binStart} – {d.binEnd} {config.unit}</p>
        <p className="font-semibold text-foreground">Count: <span className="mono">{d.count}</span></p>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} className="chart-container">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <config.icon className={`h-5 w-5 ${config.iconColor}`} />
          <div>
            <h3 className="text-sm font-semibold text-foreground">{config.title}</h3>
            <p className="text-xs text-muted-foreground">
              Tag: <span className="mono font-medium text-foreground">{config.tagId}</span> · Unit: <span className="mono font-medium text-foreground">{config.unit}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Timeseries / Histogram toggle */}
          <div className="flex bg-muted rounded-md p-0.5">
            <Button
              variant={viewMode === "timeseries" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1 px-2.5"
              onClick={() => setViewMode("timeseries")}
            >
              <TrendingUp className="h-3.5 w-3.5" /> Timeseries
            </Button>
            <Button
              variant={viewMode === "histogram" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1 px-2.5"
              onClick={() => setViewMode("histogram")}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Histogram
            </Button>
          </div>

          {/* Show/Hide Control Limits */}
          <div className="flex items-center gap-1.5">
            {showLimits ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">Limits</span>
            <Switch checked={showLimits} onCheckedChange={setShowLimits} className="scale-75" />
          </div>

          {/* Show/Hide SPC Rules */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">SPC Zones</span>
            <Switch checked={showSPCRules} onCheckedChange={setShowSPCRules} className="scale-75" />
          </div>

          {/* Download */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload} title="Export CSV">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex flex-wrap gap-4 mb-4 px-2 py-2 bg-muted/40 rounded-md border border-border/50">
        {[
          { label: "Points", value: stats.points },
          { label: "Std", value: stats.sigma },
          { label: "Pp", value: stats.pp },
          { label: "Ppk", value: stats.ppk },
          { label: "Avg", value: stats.avg },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{s.label}:</span>
            <span className="mono text-xs font-bold text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {/* X-axis toggle for timeseries */}
      {viewMode === "timeseries" && (
        <div className="flex gap-1 mb-2">
          <Button variant={xAxisMode === "time" ? "secondary" : "ghost"} size="sm" className="h-6 text-[10px] px-2" onClick={() => setXAxisMode("time")}>
            Time View
          </Button>
          <Button variant={xAxisMode === "sample" ? "secondary" : "ghost"} size="sm" className="h-6 text-[10px] px-2" onClick={() => setXAxisMode("sample")}>
            Sample View
          </Button>
        </div>
      )}

      {/* Chart */}
      {viewMode === "timeseries" ? (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={processData} margin={{ right: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey={xAxisMode === "time" ? "timestamp" : "time"}
              stroke={axisStroke}
              tick={{ fontSize: 10 }}
              interval={4}
              tickFormatter={xAxisMode === "time" ? (v: string) => format(new Date(v), "HH:mm") : undefined}
            />
            <YAxis domain={config.yDomain} stroke={axisStroke} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />

            {/* SPC Zone Bands */}
            {showSPCRules && (
              <>
                {/* Red zones - out of control */}
                <ReferenceArea y1={config.usl} y2={config.yDomain[1]} fill="hsl(0, 72%, 55%)" fillOpacity={0.08} />
                <ReferenceArea y1={config.yDomain[0]} y2={config.lsl} fill="hsl(0, 72%, 55%)" fillOpacity={0.08} />
                {/* Yellow zones - warning */}
                <ReferenceArea y1={config.ucl} y2={config.usl} fill="hsl(38, 92%, 50%)" fillOpacity={0.08} />
                <ReferenceArea y1={config.lsl} y2={config.lcl} fill="hsl(38, 92%, 50%)" fillOpacity={0.08} />
                {/* Green zone - normal */}
                <ReferenceArea y1={config.lcl} y2={config.ucl} fill="hsl(145, 65%, 42%)" fillOpacity={0.06} />
              </>
            )}

            {/* Reference Lines */}
            {showLimits && (
              <>
                <ReferenceLine y={config.target} stroke="hsl(210, 100%, 50%)" strokeDasharray="2 4" strokeWidth={1.5} label={{ value: "Target", position: "right", fill: "hsl(210, 100%, 50%)", fontSize: 9 }} />
                <ReferenceLine y={stats.avg} stroke="hsl(170, 70%, 45%)" strokeDasharray="2 2" strokeWidth={1} label={{ value: `Avg (${stats.avg})`, position: "right", fill: "hsl(170, 70%, 45%)", fontSize: 9 }} />
                <ReferenceLine y={config.usl} stroke="hsl(0, 72%, 55%)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "USL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 9 }} />
                <ReferenceLine y={config.lsl} stroke="hsl(0, 72%, 55%)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "LSL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 9 }} />
                <ReferenceLine y={config.ucl} stroke="hsl(38, 92%, 50%)" strokeWidth={1.5} label={{ value: "UCL", position: "right", fill: "hsl(38, 92%, 50%)", fontSize: 9 }} />
                <ReferenceLine y={config.lcl} stroke="hsl(38, 92%, 50%)" strokeWidth={1.5} label={{ value: "LCL", position: "right", fill: "hsl(38, 92%, 50%)", fontSize: 9 }} />
              </>
            )}

            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.lineColor}
              strokeWidth={2}
              dot={{ r: 2.5, fill: config.lineColor, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--foreground))" }}
              name={`${config.title.split(" ")[0]} ${config.unit}`}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={histogramData} margin={{ right: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="range" stroke={axisStroke} tick={{ fontSize: 10 }} label={{ value: config.unit, position: "insideBottomRight", offset: -5, fill: axisStroke, fontSize: 10 }} />
            <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: "Frequency", angle: -90, position: "insideLeft", fill: axisStroke, fontSize: 10 }} />
            <Tooltip content={<HistogramTooltip />} />
            {showLimits && (
              <>
                <ReferenceLine x={config.lsl} stroke="hsl(0, 72%, 55%)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "LSL", position: "top", fill: "hsl(0, 72%, 55%)", fontSize: 9 }} />
                <ReferenceLine x={config.usl} stroke="hsl(0, 72%, 55%)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "USL", position: "top", fill: "hsl(0, 72%, 55%)", fontSize: 9 }} />
              </>
            )}
            <Bar dataKey="count" fill={config.lineColor} fillOpacity={0.8} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-muted-foreground px-2">
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block bg-[hsl(0,72%,55%)]" style={{ borderTop: "2px dashed" }} /> USL / LSL (Spec)</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block bg-[hsl(38,92%,50%)]" /> UCL / LCL (Control)</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block bg-[hsl(210,100%,50%)]" style={{ borderTop: "2px dotted" }} /> Target</span>
        <span className="flex items-center gap-1"><span className="w-4 h-0.5 inline-block bg-[hsl(170,70%,45%)]" style={{ borderTop: "2px dotted" }} /> Average</span>
      </div>
    </motion.div>
  );
};

const ProcessAnalysis = () => {
  return (
    <DashboardLayout title="Process Analysis">
      <ProcessFilters />
      <div className="flex flex-col gap-5 mt-1">
        {chartConfigs.map((config, i) => (
          <SPCChart key={config.dataKey} config={config} delay={i * 0.1} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ProcessAnalysis;
