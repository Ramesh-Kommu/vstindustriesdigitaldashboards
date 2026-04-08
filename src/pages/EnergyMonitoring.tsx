import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import EnergyFilters from "@/components/EnergyFilters";
import { energyTrendData, equipmentEnergyData } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Brush, ReferenceArea,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

type QuickRange = "hour" | "today" | "7days" | "month";
type ChartMode = "consumption" | "cost";

const quickRangeLabel: Record<QuickRange, string> = {
  hour: "Last 1 Hour",
  today: "Today",
  "7days": "Last 7 Days",
  month: "This Month",
};

const granularityLabel: Record<QuickRange, string> = {
  hour: "1 Point = 5 Min",
  today: "1 Point = 1 Hour",
  "7days": "1 Point = 1 Day",
  month: "1 Point = 1 Day",
};

const EnergyMonitoring = () => {
  const [quickRange, setQuickRange] = useState<QuickRange>("today");
  const [chartMode, setChartMode] = useState<ChartMode>("consumption");
  const [rangeSlider, setRangeSlider] = useState<number[]>([0, 100]);

  // Derive visible data from range slider
  const visibleData = useMemo(() => {
    const start = Math.floor((rangeSlider[0] / 100) * energyTrendData.length);
    const end = Math.ceil((rangeSlider[1] / 100) * energyTrendData.length);
    return energyTrendData.slice(start, Math.max(end, start + 1));
  }, [rangeSlider]);

  // KPI summary
  const kpiSummary = useMemo(() => {
    const key = chartMode === "consumption" ? "actual" : "cost";
    const values = visibleData.map((d) => (d as any)[key] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const total = values.reduce((s, v) => s + v, 0);
    const avg = total / values.length;
    return { min, max, total, avg };
  }, [visibleData, chartMode]);

  const unit = chartMode === "consumption" ? "kWh" : "₹";
  const fmt = (v: number) => chartMode === "consumption" ? `${v.toFixed(1)} kWh` : `₹${v.toLocaleString()}`;

  const assetBarData = [...equipmentEnergyData]
    .sort((a, b) => b.consumption - a.consumption)
    .map((eq) => ({ name: eq.equipment, consumption: eq.consumption, cost: eq.cost }));

  return (
    <DashboardLayout title="Energy Monitoring & Efficiency">
      <EnergyFilters />

      {/* Energy Trend Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h3 className="text-sm font-semibold">
            {chartMode === "consumption" ? "Energy Consumption Trend (kWh)" : "Energy Cost Trend (₹)"}
          </h3>
          <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
            <button
              onClick={() => setChartMode("consumption")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-colors",
                chartMode === "consumption" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Consumption (kWh)
            </button>
            <button
              onClick={() => setChartMode("cost")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-colors",
                chartMode === "cost" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cost (₹)
            </button>
          </div>
        </div>

        {/* KPI summary row */}
        <div className="flex items-center gap-4 flex-wrap mb-2 text-xs">
          <span className="text-muted-foreground">Min: <span className="text-foreground font-medium">{fmt(kpiSummary.min)}</span></span>
          <span className="text-muted-foreground">Max: <span className="text-foreground font-medium">{fmt(kpiSummary.max)}</span></span>
          <span className="text-muted-foreground">Total: <span className="text-foreground font-medium">{fmt(kpiSummary.total)}</span></span>
          <span className="text-muted-foreground">Average: <span className="text-foreground font-medium">{fmt(kpiSummary.avg)}</span></span>
        </div>

        {/* Quick range + granularity */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            {(Object.keys(quickRangeLabel) as QuickRange[]).map((k) => (
              <button
                key={k}
                onClick={() => { setQuickRange(k); setRangeSlider([0, 100]); }}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-medium rounded transition-colors",
                  quickRange === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {quickRangeLabel[k]}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground italic">{granularityLabel[quickRange]}</span>
        </div>

        {/* Main chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={visibleData} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey="time"
              stroke={axisStroke}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke={axisStroke}
              tick={{ fontSize: 10 }}
              label={{ value: unit, angle: -90, position: "insideLeft", fontSize: 11, fill: axisStroke }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value: number) => [
                chartMode === "consumption" ? `${value} kWh` : `₹${value.toLocaleString()}`,
                chartMode === "consumption" ? "Consumption" : "Cost",
              ]}
              cursor={{ stroke: "hsl(215, 15%, 55%)", strokeWidth: 1, strokeDasharray: "4 2" }}
            />
            <Line
              type="monotone"
              dataKey={chartMode === "consumption" ? "actual" : "cost"}
              stroke={chartMode === "consumption" ? "hsl(210, 100%, 50%)" : "hsl(145, 65%, 42%)"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }}
              name={chartMode === "consumption" ? "Consumption (kWh)" : "Cost (₹)"}
            />
            <Legend />
          </LineChart>
        </ResponsiveContainer>

        {/* Range navigator slider */}
        <div className="mt-3 px-2">
          <label className="text-[10px] text-muted-foreground mb-1 block">Range Navigator</label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={rangeSlider}
            onValueChange={setRangeSlider}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
            <span>{energyTrendData[0]?.time}</span>
            <span>{energyTrendData[energyTrendData.length - 1]?.time}</span>
          </div>
        </div>
      </motion.div>

      {/* Asset-wise Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">
            Asset-wise Energy {chartMode === "consumption" ? "Consumption (kWh)" : "Cost (₹)"}
          </h3>
          <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
            <button
              onClick={() => setChartMode("consumption")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-colors",
                chartMode === "consumption" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Consumption (kWh)
            </button>
            <button
              onClick={() => setChartMode("cost")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-colors",
                chartMode === "cost" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cost (₹)
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={assetBarData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
            <XAxis type="number" stroke={axisStroke} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke={axisStroke} tick={{ fontSize: 11 }} width={100} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [
                chartMode === "consumption" ? `${value} kWh` : `₹${value.toLocaleString()}`,
                chartMode === "consumption" ? "Consumption" : "Cost",
              ]}
            />
            <Bar
              dataKey={chartMode}
              fill={chartMode === "consumption" ? "hsl(210, 100%, 50%)" : "hsl(145, 65%, 42%)"}
              radius={[0, 4, 4, 0]}
              name={chartMode === "consumption" ? "Consumption (kWh)" : "Cost (₹)"}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </DashboardLayout>
  );
};

export default EnergyMonitoring;
