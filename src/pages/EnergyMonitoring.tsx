import { useState, useMemo } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import EnergyFilters from "@/components/EnergyFilters";
import { energyTrendData, equipmentEnergyData } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

type PeriodOption = "today" | "yesterday" | "7days" | "30days" | "month" | "custom";
type ChartMode = "consumption" | "cost";

const periodLabels: Record<PeriodOption, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  month: "This Month",
  custom: "Custom Range",
};

const EnergyMonitoring = () => {
  const [period, setPeriod] = useState<PeriodOption>("today");
  const [chartMode, setChartMode] = useState<ChartMode>("consumption");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Filter data based on period (mock: just slice differently)
  const visibleData = useMemo(() => {
    switch (period) {
      case "today": return energyTrendData.slice(0, 24);
      case "yesterday": return energyTrendData.slice(0, 24);
      case "7days": return energyTrendData.slice(0, 48);
      case "30days": return energyTrendData;
      case "month": return energyTrendData;
      case "custom": return energyTrendData; // In real app, filter by dates
      default: return energyTrendData;
    }
  }, [period, startDate, endDate]);

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
        <div className="flex items-center gap-4 flex-wrap mb-3 text-xs">
          <span className="text-muted-foreground">Min: <span className="text-foreground font-medium">{fmt(kpiSummary.min)}</span></span>
          <span className="text-muted-foreground">Max: <span className="text-foreground font-medium">{fmt(kpiSummary.max)}</span></span>
          <span className="text-muted-foreground">Total: <span className="text-foreground font-medium">{fmt(kpiSummary.total)}</span></span>
          <span className="text-muted-foreground">Average: <span className="text-foreground font-medium">{fmt(kpiSummary.avg)}</span></span>
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

        {/* Period selector at bottom */}
        <div className="mt-4 pt-3 border-t border-border flex items-end justify-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground font-medium">Period</label>
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodOption)}>
              <SelectTrigger className="h-8 text-xs w-[160px] bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(periodLabels) as PeriodOption[]).map((k) => (
                  <SelectItem key={k} value={k}>{periodLabels[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {period === "custom" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-8 text-xs w-[140px] justify-start", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {startDate ? format(startDate, "dd MMM yyyy") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-8 text-xs w-[140px] justify-start", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {endDate ? format(endDate, "dd MMM yyyy") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Asset-wise Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">
            Asset-wise Energy {chartMode === "consumption" ? "Consumption (kWh)" : "Cost (₹)"}
          </h3>
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
