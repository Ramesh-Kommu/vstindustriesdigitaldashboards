import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import { kpiData, energyTrendData } from "@/data/mockData";
import { Zap, DollarSign, Package, Gauge, Droplets, Wind, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { motion } from "framer-motion";

const ExecutiveSummary = () => {
  return (
    <DashboardLayout title="Executive Summary">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard title="Total Energy Consumption" value={kpiData.totalEnergy} unit="kWh" icon={Zap} accentColor="primary" trend={{ value: 3.2, label: "vs yesterday" }} />
        <KpiCard title="Total Energy Cost" value={`₹${kpiData.energyCost.toLocaleString()}`} icon={DollarSign} accentColor="warning" trend={{ value: 2.8, label: "vs yesterday" }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Production Output" value={kpiData.productionOutput} unit="units" icon={Package} accentColor="success" trend={{ value: 5.4, label: "vs yesterday" }} />
        <KpiCard title="Energy Per Unit" value={kpiData.energyPerUnit} unit="kWh/unit" icon={Gauge} accentColor="info" trend={{ value: -2.1, label: "improving" }} />
        <KpiCard title="Avg Moisture" value={kpiData.avgMoisture} unit="%" icon={Droplets} accentColor="moisture" />
        <KpiCard title="Avg Humidity" value={kpiData.avgHumidity} unit="% RH" icon={Wind} accentColor="humidity" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="chart-container lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Energy Consumption Trend (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={energyTrendData}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 22%)" />
              <XAxis dataKey="time" stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 11 }} label={{ value: "Date-Time", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis stroke="hsl(215, 15%, 55%)" tick={{ fontSize: 11 }} label={{ value: "KW", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="actual" stroke="hsl(210, 100%, 50%)" fill="url(#actualGrad)" strokeWidth={2} name="Actual" />
              <Line type="monotone" dataKey="target" stroke="hsl(145, 65%, 42%)" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Target" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="chart-container">
          <h3 className="text-sm font-semibold mb-4">Active Alerts</h3>
          <div className="flex flex-col items-center justify-center h-[260px] gap-4">
            <div className="relative">
              <AlertTriangle className="h-16 w-16 text-warning" />
              <span className="absolute -top-1 -right-2 bg-critical text-critical-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {kpiData.activeAlerts}
              </span>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-critical" />
                <span className="text-sm">{kpiData.criticalAlerts} Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm">{kpiData.warningAlerts} Warning</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ExecutiveSummary;
