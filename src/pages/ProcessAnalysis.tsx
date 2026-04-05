import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProcessFilters from "@/components/ProcessFilters";
import { processData } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { motion } from "framer-motion";
import { Droplets, Thermometer, Wind } from "lucide-react";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

const calcStats = (values: number[], target: number, lsl: number, usl: number) => {
  const n = values.length;
  const avg = values.reduce((s, v) => s + v, 0) / n;
  const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / (n - 1));
  const pp = +((usl - lsl) / (6 * stdDev)).toFixed(3);
  const ppk = +(Math.min(usl - avg, avg - lsl) / (3 * stdDev)).toFixed(3);
  return { avg: +avg.toFixed(2), sigma: +stdDev.toFixed(3), pp, ppk };
};

interface StatCardProps {
  label: string;
  value: number | string;
}

const StatCard = ({ label, value }: StatCardProps) => (
  <div className="flex flex-col items-center p-2.5 rounded-md bg-muted/30 border border-border/50 min-w-[80px]">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="mono text-sm font-bold">{value}</span>
  </div>
);

const ProcessAnalysis = () => {
  const moistureValues = processData.map((d) => d.moisture);
  const humidityValues = processData.map((d) => d.humidity);
  const temperatureValues = processData.map((d) => d.temperature);

  const moistureStats = useMemo(() => calcStats(moistureValues, 12.5, 11.0, 14.0), []);
  const humidityStats = useMemo(() => calcStats(humidityValues, 58, 50, 65), []);
  const temperatureStats = useMemo(() => calcStats(temperatureValues, 31, 27, 35), []);

  return (
    <DashboardLayout title="Process Analysis">
      <ProcessFilters />

      {/* Moisture Control Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="h-5 w-5 text-chart-moisture" />
          <h3 className="text-sm font-semibold">Moisture Control Chart</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Target: 12.5% | LSL: 11.0% | USL: 14.0% | LCL: 11.5% | UCL: 13.5%</p>
        <div className="flex flex-wrap gap-3 mb-4">
          <StatCard label="Pp" value={moistureStats.pp} />
          <StatCard label="Ppk" value={moistureStats.ppk} />
          <StatCard label="Sigma" value={moistureStats.sigma} />
          <StatCard label="Average" value={moistureStats.avg} />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 10 }} interval={4} />
            <YAxis domain={[10, 15]} stroke={axisStroke} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <ReferenceLine y={12.5} stroke="hsl(210, 100%, 50%)" strokeDasharray="5 5" label={{ value: "Target", position: "right", fill: "hsl(210, 100%, 50%)", fontSize: 10 }} />
            <ReferenceLine y={14.0} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "USL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
            <ReferenceLine y={11.0} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "LSL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
            <ReferenceLine y={13.5} stroke="hsl(35, 92%, 50%)" strokeDasharray="4 4" label={{ value: "UCL", position: "right", fill: "hsl(35, 92%, 50%)", fontSize: 10 }} />
            <ReferenceLine y={11.5} stroke="hsl(35, 92%, 50%)" strokeDasharray="4 4" label={{ value: "LCL", position: "right", fill: "hsl(35, 92%, 50%)", fontSize: 10 }} />
            <Line type="monotone" dataKey="moisture" stroke="hsl(170, 70%, 45%)" strokeWidth={2} dot={{ r: 2, fill: "hsl(170, 70%, 45%)" }} name="Moisture %" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Temperature Control Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
        <div className="flex items-center gap-2 mb-2">
          <Thermometer className="h-5 w-5 text-critical" />
          <h3 className="text-sm font-semibold">Temperature Control Chart</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Target: 31°C | LSL: 27°C | USL: 35°C | LCL: 28°C | UCL: 34°C</p>
        <div className="flex flex-wrap gap-3 mb-4">
          <StatCard label="Pp" value={temperatureStats.pp} />
          <StatCard label="Ppk" value={temperatureStats.ppk} />
          <StatCard label="Sigma" value={temperatureStats.sigma} />
          <StatCard label="Average" value={temperatureStats.avg} />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 10 }} interval={4} />
            <YAxis domain={[25, 38]} stroke={axisStroke} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <ReferenceLine y={31} stroke="hsl(210, 100%, 50%)" strokeDasharray="5 5" label={{ value: "Target", position: "right", fill: "hsl(210, 100%, 50%)", fontSize: 10 }} />
            <ReferenceLine y={35} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "USL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
            <ReferenceLine y={27} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "LSL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
            <ReferenceLine y={34} stroke="hsl(35, 92%, 50%)" strokeDasharray="4 4" label={{ value: "UCL", position: "right", fill: "hsl(35, 92%, 50%)", fontSize: 10 }} />
            <ReferenceLine y={28} stroke="hsl(35, 92%, 50%)" strokeDasharray="4 4" label={{ value: "LCL", position: "right", fill: "hsl(35, 92%, 50%)", fontSize: 10 }} />
            <Line type="monotone" dataKey="temperature" stroke="hsl(0, 72%, 55%)" strokeWidth={2} dot={{ r: 2, fill: "hsl(0, 72%, 55%)" }} name="Temperature °C" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Humidity Control Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="chart-container">
        <div className="flex items-center gap-2 mb-2">
          <Wind className="h-5 w-5 text-chart-humidity" />
          <h3 className="text-sm font-semibold">Humidity Control Chart</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Target: 58% | LSL: 50% | USL: 65% | LCL: 52% | UCL: 63%</p>
        <div className="flex flex-wrap gap-3 mb-4">
          <StatCard label="Pp" value={humidityStats.pp} />
          <StatCard label="Ppk" value={humidityStats.ppk} />
          <StatCard label="Sigma" value={humidityStats.sigma} />
          <StatCard label="Average" value={humidityStats.avg} />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 10 }} interval={4} />
            <YAxis domain={[45, 70]} stroke={axisStroke} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <ReferenceLine y={58} stroke="hsl(210, 100%, 50%)" strokeDasharray="5 5" label={{ value: "Target", position: "right", fill: "hsl(210, 100%, 50%)", fontSize: 10 }} />
            <ReferenceLine y={65} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "USL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
            <ReferenceLine y={50} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "LSL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
            <ReferenceLine y={63} stroke="hsl(35, 92%, 50%)" strokeDasharray="4 4" label={{ value: "UCL", position: "right", fill: "hsl(35, 92%, 50%)", fontSize: 10 }} />
            <ReferenceLine y={52} stroke="hsl(35, 92%, 50%)" strokeDasharray="4 4" label={{ value: "LCL", position: "right", fill: "hsl(35, 92%, 50%)", fontSize: 10 }} />
            <Line type="monotone" dataKey="humidity" stroke="hsl(290, 60%, 55%)" strokeWidth={2} dot={{ r: 2, fill: "hsl(290, 60%, 55%)" }} name="Humidity % RH" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProcessAnalysis;
