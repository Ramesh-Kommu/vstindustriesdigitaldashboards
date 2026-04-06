import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import EnergyFilters from "@/components/EnergyFilters";
import { energyTrendData, equipmentEnergyData } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

type TimePeriod = "hour" | "today" | "yesterday" | "thisWeek" | "prevWeek" | "month" | "custom";
type ChartMode = "consumption" | "cost";

const EnergyMonitoring = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("today");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartMode, setChartMode] = useState<ChartMode>("consumption");

  const assetBarData = [...equipmentEnergyData]
    .sort((a, b) => b.consumption - a.consumption)
    .map((eq) => ({
      name: eq.equipment,
      consumption: eq.consumption,
      cost: eq.cost,
    }));

  const periodLabel: Record<TimePeriod, string> = {
    hour: "Last 1 Hour",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    prevWeek: "Previous Week",
    month: "This Month",
    custom: "Custom",
  };

  return (
    <DashboardLayout title="Energy Monitoring & Efficiency">
      <EnergyFilters />

      {/* Time Period Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs font-medium text-muted-foreground">Period:</label>
        <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
          <SelectTrigger className="w-[160px] h-9 bg-card border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(periodLabel).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {timePeriod === "custom" && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-9 justify-start text-left font-normal text-sm gap-2 min-w-[160px]")}>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                {format(selectedDate, "dd MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Energy Control Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
        <h3 className="text-sm font-semibold mb-4">Energy Consumption (kWh) – {periodLabel[timePeriod]}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={energyTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: "Date-Time", position: "insideBottom", offset: -2, fontSize: 11, fill: axisStroke }} />
            <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: chartMode === "consumption" ? "kWh" : "₹", angle: -90, position: "insideLeft", fontSize: 11, fill: axisStroke }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [
              chartMode === "consumption" ? `${value} kWh` : `₹${value.toLocaleString()}`,
              chartMode === "consumption" ? "Consumption" : "Cost",
            ]} />
            <Line type="monotone" dataKey={chartMode === "consumption" ? "actual" : "cost"} stroke={chartMode === "consumption" ? "hsl(210, 100%, 50%)" : "hsl(145, 65%, 42%)"} strokeWidth={2} dot={false} name={chartMode === "consumption" ? "Consumption (kWh)" : "Cost (₹)"} />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Consolidated Asset Chart with Toggle */}
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
