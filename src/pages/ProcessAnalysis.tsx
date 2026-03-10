import DashboardLayout from "@/components/DashboardLayout";
import { processData, moistureByLine, humidityByLine } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { motion } from "framer-motion";
import { Droplets, Wind } from "lucide-react";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

const StatusBadge = ({ status }: { status: string }) => {
  const cls = status === "Normal" ? "status-normal" : status === "Warning" ? "status-warning" : "status-critical";
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{status}</span>;
};

const ProcessAnalysis = () => {
  return (
    <DashboardLayout title="Process Analysis">
      {/* Sensor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="h-5 w-5 text-chart-moisture" />
            <h3 className="text-sm font-semibold">Moisture by Production Line</h3>
          </div>
          <div className="space-y-3">
            {moistureByLine.map((item) => (
              <div key={item.line} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
                <div>
                  <span className="font-medium text-sm">{item.line}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="mono text-lg font-bold">{item.current}%</span>
                    <span className="text-xs text-muted-foreground">Target: {item.target}%</span>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="h-5 w-5 text-chart-humidity" />
            <h3 className="text-sm font-semibold">Humidity by Production Line</h3>
          </div>
          <div className="space-y-3">
            {humidityByLine.map((item) => (
              <div key={item.line} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
                <div>
                  <span className="font-medium text-sm">{item.line}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="mono text-lg font-bold">{item.current}% RH</span>
                    <span className="text-xs text-muted-foreground">Target: {item.target}%</span>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Control Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="chart-container">
          <h3 className="text-sm font-semibold mb-1">Moisture Control Chart</h3>
          <p className="text-xs text-muted-foreground mb-4">Target: 12.5% | LSL: 11.0% | USL: 14.0%</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 10 }} interval={4} />
              <YAxis domain={[10, 15]} stroke={axisStroke} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={12.5} stroke="hsl(210, 100%, 50%)" strokeDasharray="5 5" label={{ value: "Target", position: "right", fill: "hsl(210, 100%, 50%)", fontSize: 10 }} />
              <ReferenceLine y={14.0} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "USL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
              <ReferenceLine y={11.0} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "LSL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
              <Line type="monotone" dataKey="moisture" stroke="hsl(170, 70%, 45%)" strokeWidth={2} dot={{ r: 2, fill: "hsl(170, 70%, 45%)" }} name="Moisture %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="chart-container">
          <h3 className="text-sm font-semibold mb-1">Humidity Control Chart</h3>
          <p className="text-xs text-muted-foreground mb-4">Target: 58% | LSL: 50% | USL: 65%</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 10 }} interval={4} />
              <YAxis domain={[45, 70]} stroke={axisStroke} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={58} stroke="hsl(210, 100%, 50%)" strokeDasharray="5 5" label={{ value: "Target", position: "right", fill: "hsl(210, 100%, 50%)", fontSize: 10 }} />
              <ReferenceLine y={65} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "USL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
              <ReferenceLine y={50} stroke="hsl(0, 72%, 55%)" strokeDasharray="3 3" label={{ value: "LSL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 10 }} />
              <Line type="monotone" dataKey="humidity" stroke="hsl(290, 60%, 55%)" strokeWidth={2} dot={{ r: 2, fill: "hsl(290, 60%, 55%)" }} name="Humidity % RH" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProcessAnalysis;
