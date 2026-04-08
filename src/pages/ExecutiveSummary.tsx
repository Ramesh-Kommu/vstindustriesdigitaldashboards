import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import DashboardDateFilter, { type FilterMode } from "@/components/DashboardDateFilter";
import { kpiData, energyTrendData, equipmentEnergyData } from "@/data/mockData";
import { Zap, IndianRupee, Package, Gauge, Droplets, Wind, AlertTriangle, Trophy, TrendingUp, TrendingDown, BarChart3, Table2 } from "lucide-react";
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, LabelList } from "recharts";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

const totalConsumption = equipmentEnergyData.reduce((s, e) => s + e.consumption, 0);
const totalCost = equipmentEnergyData.reduce((s, e) => s + e.cost, 0);

const top5Consumers = [...equipmentEnergyData]
  .sort((a, b) => b.consumption - a.consumption)
  .slice(0, 5)
  .map((eq, i) => ({
    rank: i + 1,
    name: eq.equipment,
    consumption: eq.consumption,
    cost: eq.cost,
    line: eq.line,
    status: eq.status,
    contribution: +((eq.consumption / totalConsumption) * 100).toFixed(1),
    costContribution: +((eq.cost / totalCost) * 100).toFixed(1),
    trend: eq.consumption - eq.prevConsumption,
    trendPct: +(((eq.consumption - eq.prevConsumption) / eq.prevConsumption) * 100).toFixed(1),
  }));

const barColors = [
  "hsl(35, 92%, 50%)",
  "hsl(35, 85%, 55%)",
  "hsl(35, 78%, 60%)",
  "hsl(35, 70%, 65%)",
  "hsl(35, 62%, 70%)",
];

const secValue = +(kpiData.totalEnergy / kpiData.productionOutput).toFixed(2);

type Top5Mode = "consumption" | "cost";
type Top5View = "chart" | "table";

const CustomBarTooltip = ({ active, payload, mode }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isUp = d.trendPct >= 0;
  return (
    <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-md text-xs space-y-1.5 min-w-[180px]">
      <div className="font-semibold text-sm">{d.name}</div>
      <div className="text-muted-foreground">Line: {d.line}</div>
      <div>Consumption: <span className="font-medium">{d.consumption.toLocaleString()} kWh</span></div>
      <div>Cost: <span className="font-medium">₹{d.cost.toLocaleString()}</span></div>
      <div>Contribution: <span className="font-medium">{mode === "consumption" ? d.contribution : d.costContribution}%</span></div>
      <div className="flex items-center gap-1">
        Trend:
        {isUp ? <TrendingUp className="h-3 w-3 text-critical" /> : <TrendingDown className="h-3 w-3 text-success" />}
        <span className={isUp ? "text-critical font-medium" : "text-success font-medium"}>
          {d.trendPct > 0 ? "+" : ""}{d.trendPct}%
        </span>
      </div>
    </div>
  );
};

const ExecutiveSummary = () => {
  const [filterMode, setFilterMode] = useState<FilterMode>("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [top5Mode, setTop5Mode] = useState<Top5Mode>("consumption");
  const [top5View, setTop5View] = useState<Top5View>("chart");

  const chartTitle =
    filterMode === "hour" ? "Energy Consumption Trend (Last 1 Hour)" :
    filterMode === "day" ? "Energy Consumption Trend (Today)" :
    filterMode === "week" ? "Energy Consumption Trend (Weekly)" :
    "Energy Consumption Trend (Monthly)";

  const sortedTop5 = useMemo(() => {
    const key = top5Mode === "consumption" ? "consumption" : "cost";
    return [...top5Consumers].sort((a, b) => (b as any)[key] - (a as any)[key]).map((item, i) => ({ ...item, rank: i + 1 }));
  }, [top5Mode]);

  const dataKey = top5Mode === "consumption" ? "consumption" : "cost";
  const unitLabel = top5Mode === "consumption" ? "kWh" : "₹";

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
        <KpiCard title="Specific Energy Consumption (SEC)" value={secValue} unit="kWh / Million Sticks" icon={Gauge} accentColor="info" trend={{ value: -1.5, label: "improving" }} />
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
              <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: "kWh", angle: -90, position: "insideLeft", fontSize: 11, fill: axisStroke }} />
              <ReTooltip contentStyle={tooltipStyle} />
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            <h3 className="text-sm font-semibold">Top 5 Electricity Consumers</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Consumption / Cost toggle */}
            <div className="flex rounded-md border border-border overflow-hidden text-xs">
              <button
                onClick={() => setTop5Mode("consumption")}
                className={`px-3 py-1.5 transition-colors ${top5Mode === "consumption" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              >
                kWh
              </button>
              <button
                onClick={() => setTop5Mode("cost")}
                className={`px-3 py-1.5 transition-colors ${top5Mode === "cost" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              >
                ₹ Cost
              </button>
            </div>
            {/* Chart / Table toggle */}
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setTop5View("chart")}
                className={`p-1.5 transition-colors ${top5View === "chart" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTop5View("table")}
                className={`p-1.5 transition-colors ${top5View === "table" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              >
                <Table2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {top5View === "chart" ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sortedTop5} layout="vertical" margin={{ left: 10, right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
              <XAxis
                type="number"
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => top5Mode === "cost" ? `₹${v.toLocaleString()}` : v.toLocaleString()}
                label={{ value: unitLabel, position: "insideBottom", offset: -2, fontSize: 11, fill: axisStroke }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke={axisStroke}
                tick={({ x, y, payload }: any) => {
                  const item = sortedTop5.find((d) => d.name === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-8} y={0} dy={4} textAnchor="end" fill={axisStroke} fontSize={11}>
                        {payload.value}
                      </text>
                      {item && (
                        <circle cx={-120} cy={1} r={9} fill="hsl(35, 92%, 50%)" fillOpacity={0.2} stroke="hsl(35, 92%, 50%)" strokeWidth={1} />
                      )}
                      {item && (
                        <text x={-120} y={5} textAnchor="middle" fill="hsl(35, 92%, 50%)" fontSize={9} fontWeight="bold">
                          #{item.rank}
                        </text>
                      )}
                    </g>
                  );
                }}
                width={140}
              />
              <ReTooltip content={<CustomBarTooltip mode={top5Mode} />} cursor={{ fill: "hsl(220, 14%, 22%)", fillOpacity: 0.3 }} />
              <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} barSize={28}>
                {sortedTop5.map((_, i) => (
                  <Cell key={i} fill={barColors[i]} />
                ))}
                <LabelList
                  dataKey={dataKey}
                  position="right"
                  formatter={(v: number) => top5Mode === "cost" ? `₹${v.toLocaleString()}` : `${v.toLocaleString()} kWh`}
                  style={{ fontSize: 11, fill: axisStroke, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Table View */
          <div className="space-y-2">
            {sortedTop5.map((item) => {
              const isUp = item.trendPct >= 0;
              return (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-warning/20 text-warning text-xs font-bold flex items-center justify-center">#{item.rank}</span>
                    <div>
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.line}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {top5Mode === "consumption" ? `${item.contribution}%` : `${item.costContribution}%`}
                    </span>
                    <div className="flex items-center gap-1">
                      {isUp ? <TrendingUp className="h-3 w-3 text-critical" /> : <TrendingDown className="h-3 w-3 text-success" />}
                      <span className={`text-xs font-medium ${isUp ? "text-critical" : "text-success"}`}>
                        {item.trendPct > 0 ? "+" : ""}{item.trendPct}%
                      </span>
                    </div>
                    <span className="mono text-sm font-bold">
                      {top5Mode === "cost" ? `₹${item.cost.toLocaleString()}` : `${item.consumption.toLocaleString()} kWh`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ExecutiveSummary;
