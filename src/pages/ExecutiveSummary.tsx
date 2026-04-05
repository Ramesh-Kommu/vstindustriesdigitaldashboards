import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import DashboardDateFilter, { type FilterMode } from "@/components/DashboardDateFilter";
import { kpiData, energyTrendData, equipmentEnergyData } from "@/data/mockData";
import { Zap, IndianRupee, Package, Gauge, Droplets, Wind, AlertTriangle, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

const totalConsumption = equipmentEnergyData.reduce((s, e) => s + e.consumption, 0);

const top5Consumers = [...equipmentEnergyData]
  .sort((a, b) => b.consumption - a.consumption)
  .slice(0, 5)
  .map((eq, i) => ({
    rank: i + 1,
    name: eq.equipment,
    consumption: eq.consumption,
    line: eq.line,
    contribution: +((eq.consumption / totalConsumption) * 100).toFixed(1),
    trend: eq.consumption - eq.prevConsumption,
    trendPct: +(((eq.consumption - eq.prevConsumption) / eq.prevConsumption) * 100).toFixed(1),
  }));

const secValue = +(kpiData.totalEnergy / kpiData.productionOutput).toFixed(2);

const ExecutiveSummary = () => {
  const [filterMode, setFilterMode] = useState<FilterMode>("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const chartTitle =
    filterMode === "hour" ? "Energy Consumption Trend (Last 1 Hour)" :
    filterMode === "day" ? "Energy Consumption Trend (Today)" :
    filterMode === "week" ? "Energy Consumption Trend (Weekly)" :
    "Energy Consumption Trend (Monthly)";

  return (
    <DashboardLayout title="Executive Summary">
      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Dashboard Overview</h2>
        <DashboardDateFilter mode={filterMode} onModeChange={setFilterMode} selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard title="Total Energy Consumption" value={kpiData.totalEnergy} unit="kWh" icon={Zap} accentColor="primary" trend={{ value: 3.2, label: "vs yesterday" }} />
        <KpiCard title="Total Energy Cost" value={`₹${kpiData.energyCost.toLocaleString()}`} icon={IndianRupee} accentColor="warning" trend={{ value: 2.8, label: "vs yesterday" }} />
        <KpiCard title="Specific Energy Consumption (SEC)" value={secValue} unit="kWh / Million Sticks" subtitle="Total Energy Consumed ÷ Total Production Output" icon={Gauge} accentColor="info" trend={{ value: -1.5, label: "improving" }} />
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
          <h3 className="text-sm font-semibold mb-4">{chartTitle}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={energyTrendData}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: "Date-Time", position: "insideBottom", offset: -2, fontSize: 11, fill: axisStroke }} />
              <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: "KW", angle: -90, position: "insideLeft", fontSize: 11, fill: axisStroke }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="actual" stroke="hsl(210, 100%, 50%)" fill="url(#actualGrad)" strokeWidth={2} name="Actual" />
              <Legend />
            </ComposedChart>
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

      {/* Top 5 Electricity Consumers - Enhanced */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="chart-container">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-warning" />
          <h3 className="text-sm font-semibold">Top 5 Electricity Consumers</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={top5Consumers} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
              <XAxis type="number" stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: "kWh", position: "insideBottom", offset: -2, fontSize: 11, fill: axisStroke }} />
              <YAxis type="category" dataKey="name" stroke={axisStroke} tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => {
                if (name === "Consumption (kWh)") return [`${value} kWh`, "Consumption"];
                return [`${value}%`, "Contribution"];
              }} />
              <Bar dataKey="consumption" fill="hsl(35, 92%, 50%)" radius={[0, 4, 4, 0]} name="Consumption (kWh)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {top5Consumers.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-warning/20 text-warning text-xs font-bold flex items-center justify-center">#{item.rank}</span>
                  <div>
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{item.line}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{item.contribution}%</span>
                  <div className="flex items-center gap-1">
                    {item.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-critical" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-success" />
                    )}
                    <span className={`text-xs font-medium ${item.trend >= 0 ? "text-critical" : "text-success"}`}>
                      {item.trendPct > 0 ? "+" : ""}{item.trendPct}%
                    </span>
                  </div>
                  <span className="mono text-sm font-bold">{item.consumption} kWh</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ExecutiveSummary;
