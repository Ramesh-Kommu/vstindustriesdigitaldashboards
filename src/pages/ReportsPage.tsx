import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  energyTrendData, equipmentEnergyData, processData, alertsData,
  kpiData,
} from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine, ReferenceArea,
} from "recharts";
import {
  Zap, IndianRupee, Gauge, Droplets, Wind, AlertTriangle, CheckCircle,
  XCircle, Eye, Download, FileText, CalendarIcon, ExternalLink, Search,
  ChevronLeft, ChevronRight, FileSpreadsheet, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

const units = ["All", "Unit 1", "Unit 2", "Unit 3", "PMD", "SMD"];
const lines = ["All", "Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];
const machines = ["All", "Compressor A", "Dryer B", "Motor C", "Furnace D", "Pump E", "Conveyor F"];
const parameters = ["All", "Energy", "Moisture", "Humidity"];
const skus = ["All", "Blend A", "Blend B", "Blend C", "SKU-100", "SKU-200"];
const shifts = ["All", "Shift A", "Shift B", "Shift C"];

type ReportType = "energy" | "process" | "alerts" | "production";
type PeriodOption = "today" | "yesterday" | "7days" | "30days" | "month" | "custom";
type ChartMode = "consumption" | "cost";

const periodLabels: Record<PeriodOption, string> = {
  today: "Today", yesterday: "Yesterday", "7days": "Last 7 Days",
  "30days": "Last 30 Days", month: "This Month", custom: "Custom Range",
};

const PAGE_SIZE = 10;

const calcStats = (values: number[], lsl: number, usl: number) => {
  const n = values.length;
  const avg = values.reduce((s, v) => s + v, 0) / n;
  const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / (n - 1));
  const pp = +((usl - lsl) / (6 * stdDev)).toFixed(3);
  const ppk = +(Math.min(usl - avg, avg - lsl) / (3 * stdDev)).toFixed(3);
  return { avg: +avg.toFixed(2), sigma: +stdDev.toFixed(3), pp, ppk };
};

const ReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>("energy");
  const [period, setPeriod] = useState<PeriodOption>("today");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [chartMode, setChartMode] = useState<ChartMode>("consumption");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Filters
  const [filterUnit, setFilterUnit] = useState("All");
  const [filterLine, setFilterLine] = useState("All");
  const [filterMachine, setFilterMachine] = useState("All");
  const [filterParam, setFilterParam] = useState("All");
  const [filterSku, setFilterSku] = useState("All");
  const [filterShift, setFilterShift] = useState("All");

  // Energy KPIs
  const energyKpis = useMemo(() => {
    const vals = energyTrendData.map((d) => d.actual);
    const total = vals.reduce((s, v) => s + v, 0);
    const avg = total / vals.length;
    const totalCost = energyTrendData.reduce((s, d) => s + ((d as any).cost || d.actual * 7.5), 0);
    const sec = +(total / kpiData.productionOutput).toFixed(2);
    return { total: +total.toFixed(0), cost: +totalCost.toFixed(0), avg: +avg.toFixed(1), sec };
  }, []);

  // Process KPIs
  const processKpis = useMemo(() => {
    const moistureVals = processData.map((d) => d.moisture);
    return calcStats(moistureVals, 11.0, 14.0);
  }, []);

  // Alerts KPIs
  const alertKpis = useMemo(() => ({
    total: alertsData.length,
    critical: alertsData.filter((a) => a.severity === "Critical").length,
    warning: alertsData.filter((a) => a.severity === "Warning").length,
    acknowledged: alertsData.filter((a) => a.acknowledged).length,
  }), []);

  // Energy table data
  const energyTableData = useMemo(() => {
    let data = equipmentEnergyData.map((eq) => ({
      timestamp: "2026-03-10 14:00",
      machine: eq.equipment,
      line: eq.line,
      consumption: eq.consumption,
      cost: eq.cost,
      status: eq.status,
    }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((d) => d.machine.toLowerCase().includes(q) || d.line.toLowerCase().includes(q));
    }
    return data;
  }, [searchQuery]);

  // Process table data
  const processTableData = useMemo(() => {
    let data = processData.map((d) => ({
      timestamp: format(new Date(d.timestamp), "yyyy-MM-dd HH:mm"),
      parameter: "Moisture",
      value: d.moisture,
      lsl: d.moistureLSL,
      usl: d.moistureUSL,
      status: d.moisture >= d.moistureLSL && d.moisture <= d.moistureUSL ? "Normal" : d.moisture > d.moistureUCL || d.moisture < d.moistureLCL ? "Critical" : "Warning",
    }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((d) => d.parameter.toLowerCase().includes(q) || d.status.toLowerCase().includes(q));
    }
    return data;
  }, [searchQuery]);

  // Alerts table data
  const alertsTableData = useMemo(() => {
    let data = alertsData.map((a) => ({
      id: a.id,
      timestamp: a.timestamp,
      equipment: a.equipment || "—",
      line: a.productionLine,
      parameter: a.parameter,
      severity: a.severity,
      value: a.currentValue != null ? `${a.currentValue} ${a.unit}` : "—",
      threshold: a.threshold != null ? `${a.threshold} ${a.unit}` : "—",
      status: a.acknowledged ? "Acknowledged" : "Active",
    }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((d) => d.equipment.toLowerCase().includes(q) || d.parameter.toLowerCase().includes(q) || d.id.toLowerCase().includes(q));
    }
    return data;
  }, [searchQuery]);

  // Production table data
  const productionTableData = useMemo(() => {
    let data = energyTrendData.map((d, i) => ({
      timestamp: `2026-03-10 ${d.time}`,
      unit: units[1 + (i % (units.length - 1))],
      line: lines[1 + (i % (lines.length - 1))],
      machine: machines[1 + (i % (machines.length - 1))],
      production: Math.round(180 + Math.random() * 40),
      consumption: d.actual,
      energyPerUnit: +(d.actual / (180 + i * 0.5)).toFixed(2),
      moisture: +(11 + Math.random() * 2.5).toFixed(1),
      humidity: +(55 + Math.random() * 8).toFixed(1),
    }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((d) => d.machine.toLowerCase().includes(q) || d.line.toLowerCase().includes(q) || d.unit.toLowerCase().includes(q));
    }
    return data;
  }, [searchQuery]);

  const currentTableData = reportType === "energy" ? energyTableData : reportType === "process" ? processTableData : reportType === "production" ? productionTableData : alertsTableData;
  const totalPages = Math.max(1, Math.ceil(currentTableData.length / PAGE_SIZE));
  const pagedData = currentTableData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [exporting, setExporting] = useState(false);

  const getFileName = useCallback(() => {
    const typeLabel = reportType.charAt(0).toUpperCase() + reportType.slice(1);
    const unitPart = filterUnit !== "All" ? `_${filterUnit.replace(/\s/g, "")}` : "";
    const linePart = filterLine !== "All" ? `_${filterLine.replace(/\s/g, "")}` : "";
    const datePart = `_${format(new Date(), "yyyyMMdd")}`;
    return `${typeLabel}Report${unitPart}${linePart}${datePart}`;
  }, [reportType, filterUnit, filterLine]);

  const buildCSVContent = useCallback(() => {
    let csv = "";
    if (reportType === "energy") {
      csv = ["Timestamp,Machine,Line,Consumption (kWh),Cost (₹),Status", ...energyTableData.map((d) => `${d.timestamp},${d.machine},${d.line},${d.consumption},${d.cost},${d.status}`)].join("\n");
    } else if (reportType === "process") {
      csv = ["Timestamp,Parameter,Value,LSL,USL,Status", ...processTableData.map((d) => `${d.timestamp},${d.parameter},${d.value},${d.lsl},${d.usl},${d.status}`)].join("\n");
    } else if (reportType === "production") {
      csv = ["Timestamp,Unit,Line,Machine,Production (units),Consumption (kWh),Energy/Unit,Moisture (%),Humidity (% RH)", ...productionTableData.map((d) => `${d.timestamp},${d.unit},${d.line},${d.machine},${d.production},${d.consumption},${d.energyPerUnit},${d.moisture},${d.humidity}`)].join("\n");
    } else {
      csv = ["ID,Timestamp,Equipment,Line,Parameter,Severity,Value,Threshold,Status", ...alertsTableData.map((d) => `${d.id},${d.timestamp},${d.equipment},${d.line},${d.parameter},${d.severity},${d.value},${d.threshold},${d.status}`)].join("\n");
    }
    return csv;
  }, [reportType, energyTableData, processTableData, alertsTableData, productionTableData]);

  const handleExportCSV = useCallback(() => {
    setExporting(true);
    setTimeout(() => {
      const csv = buildCSVContent();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${getFileName()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
      toast.success("Report downloaded successfully", { description: `${getFileName()}.csv` });
    }, 600);
  }, [buildCSVContent, getFileName]);

  const handleExportExcel = useCallback(() => {
    setExporting(true);
    setTimeout(() => {
      const csv = buildCSVContent();
      const blob = new Blob([csv], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${getFileName()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
      toast.success("Report downloaded successfully", { description: `${getFileName()}.xlsx` });
    }, 600);
  }, [buildCSVContent, getFileName]);

  const handleExportPDF = useCallback(() => {
    setExporting(true);
    setTimeout(() => {
      const csv = buildCSVContent();
      const lines = csv.split("\n");
      const header = lines[0];
      const content = `${reportType.toUpperCase()} REPORT\n\nFilters: Unit=${filterUnit}, Line=${filterLine}, Machine=${filterMachine}, SKU=${filterSku}, Shift=${filterShift}, Period=${periodLabels[period]}\nGenerated: ${format(new Date(), "dd MMM yyyy HH:mm")}\n\n${header}\n${"─".repeat(80)}\n${lines.slice(1).join("\n")}`;
      const blob = new Blob([content], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${getFileName()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
      toast.success("Report downloaded successfully", { description: `${getFileName()}.pdf` });
    }, 800);
  }, [buildCSVContent, getFileName, reportType, filterUnit, filterLine, filterMachine, filterSku, filterShift, period]);

  const filterBar = (
    <div className="flex flex-wrap items-end gap-3">
      {[
        { label: "Unit", value: filterUnit, setter: setFilterUnit, opts: units },
        { label: "Line", value: filterLine, setter: setFilterLine, opts: lines },
        { label: "Machine", value: filterMachine, setter: setFilterMachine, opts: machines },
        { label: "Parameter", value: filterParam, setter: setFilterParam, opts: parameters },
        { label: "SKU / Blend", value: filterSku, setter: setFilterSku, opts: skus },
        { label: "Shift", value: filterShift, setter: setFilterShift, opts: shifts },
      ].map((f) => (
        <div key={f.label} className="flex flex-col gap-1 min-w-[130px] flex-1 max-w-[170px]">
          <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
          <Select value={f.value} onValueChange={f.setter}>
            <SelectTrigger className="h-9 text-sm bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {f.opts.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );

  const periodSelector = (
    <div className="mt-4 pt-3 border-t border-border flex items-end justify-end gap-3 flex-wrap">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-muted-foreground font-medium">Period</label>
        <Select value={period} onValueChange={(v) => { setPeriod(v as PeriodOption); setPage(1); }}>
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
  );

  return (
    <DashboardLayout title="Reports">
      {/* Filter Bar */}
      {filterBar}

      {/* Report Type Tabs */}
      <Tabs value={reportType} onValueChange={(v) => { setReportType(v as ReportType); setPage(1); setSearchQuery(""); }} className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="energy">Energy Reports</TabsTrigger>
          <TabsTrigger value="process">Process (SPC) Reports</TabsTrigger>
          <TabsTrigger value="alerts">Alerts Reports</TabsTrigger>
          <TabsTrigger value="production">Production Reports</TabsTrigger>
        </TabsList>

        {/* === ENERGY REPORT === */}
        <TabsContent value="energy" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Consumption", value: `${energyKpis.total.toLocaleString()} kWh`, icon: <Zap className="h-5 w-5 text-primary" />, bg: "bg-primary/10" },
              { label: "Total Cost", value: `₹${energyKpis.cost.toLocaleString()}`, icon: <IndianRupee className="h-5 w-5 text-warning" />, bg: "bg-warning/10" },
              { label: "Avg Consumption", value: `${energyKpis.avg} kWh`, icon: <Gauge className="h-5 w-5 text-info" />, bg: "bg-info/10" },
              { label: "SEC", value: `${energyKpis.sec} kWh/unit`, icon: <Gauge className="h-5 w-5 text-success" />, bg: "bg-success/10" },
            ].map((c) => (
              <div key={c.label} className="kpi-card flex items-center gap-3">
                <div className={`p-2 rounded-md ${c.bg}`}>{c.icon}</div>
                <div>
                  <div className="text-lg font-bold mono">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Energy Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="text-sm font-semibold">
                {chartMode === "consumption" ? "Energy Consumption Trend (kWh)" : "Energy Cost Trend (₹)"}
              </h3>
              <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                <button onClick={() => setChartMode("consumption")} className={cn("px-3 py-1 text-xs font-medium rounded transition-colors", chartMode === "consumption" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  Consumption (kWh)
                </button>
                <button onClick={() => setChartMode("cost")} className={cn("px-3 py-1 text-xs font-medium rounded transition-colors", chartMode === "cost" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  Cost (₹)
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={energyTrendData} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis stroke={axisStroke} tick={{ fontSize: 10 }} label={{ value: chartMode === "consumption" ? "kWh" : "₹", angle: -90, position: "insideLeft", fontSize: 11, fill: axisStroke }} />
                <ReTooltip contentStyle={tooltipStyle} formatter={(value: number) => [chartMode === "consumption" ? `${value} kWh` : `₹${value.toLocaleString()}`, chartMode === "consumption" ? "Consumption" : "Cost"]} cursor={{ stroke: axisStroke, strokeWidth: 1, strokeDasharray: "4 2" }} />
                <Line type="monotone" dataKey={chartMode === "consumption" ? "actual" : "cost"} stroke={chartMode === "consumption" ? "hsl(210, 100%, 50%)" : "hsl(145, 65%, 42%)"} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>

            {periodSelector}
          </motion.div>

          {/* Energy Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Detailed Data</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search…" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="h-8 text-xs pl-8 w-[180px] bg-card" />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportCSV}><Download className="h-3.5 w-3.5" />CSV</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportCSV}><Download className="h-3.5 w-3.5" />Excel</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3 text-xs">Timestamp</th>
                    <th className="text-left py-2 px-3 text-xs">Machine</th>
                    <th className="text-left py-2 px-3 text-xs">Line</th>
                    <th className="text-right py-2 px-3 text-xs">Consumption (kWh)</th>
                    <th className="text-right py-2 px-3 text-xs">Cost (₹)</th>
                    <th className="text-left py-2 px-3 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedData as typeof energyTableData).map((d, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{(d as any).timestamp}</td>
                      <td className="py-2.5 px-3 text-xs font-medium">{(d as any).machine || (d as any).equipment || "—"}</td>
                      <td className="py-2.5 px-3 text-xs">{(d as any).line || "—"}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).consumption?.toLocaleString() || "—"}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">₹{(d as any).cost?.toLocaleString() || "—"}</td>
                      <td className="py-2.5 px-3 text-xs"><span className="status-normal text-xs px-2 py-0.5 rounded-full border">{(d as any).status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages} ({currentTableData.length} records)</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* === PROCESS REPORT === */}
        <TabsContent value="process" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Pp", value: processKpis.pp, bg: "bg-primary/10", icon: <Gauge className="h-5 w-5 text-primary" /> },
              { label: "Ppk", value: processKpis.ppk, bg: "bg-info/10", icon: <Gauge className="h-5 w-5 text-info" /> },
              { label: "Sigma", value: processKpis.sigma, bg: "bg-warning/10", icon: <Wind className="h-5 w-5 text-warning" /> },
              { label: "Average", value: processKpis.avg, bg: "bg-success/10", icon: <Droplets className="h-5 w-5 text-success" /> },
            ].map((c) => (
              <div key={c.label} className="kpi-card flex items-center gap-3">
                <div className={`p-2 rounded-md ${c.bg}`}>{c.icon}</div>
                <div>
                  <div className="text-lg font-bold mono">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* SPC Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
            <h3 className="text-sm font-semibold mb-3">Moisture Control Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processData} margin={{ right: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="timestamp" stroke={axisStroke} tick={{ fontSize: 10 }} interval={4} tickFormatter={(v: string) => format(new Date(v), "HH:mm")} />
                <YAxis domain={[10, 15]} stroke={axisStroke} tick={{ fontSize: 11 }} />
                <ReTooltip contentStyle={tooltipStyle} labelFormatter={(v: string) => format(new Date(v), "dd MMM yyyy, HH:mm")} formatter={(v: number) => [`${v} %`, "Moisture"]} cursor={{ stroke: axisStroke, strokeWidth: 1, strokeDasharray: "4 2" }} />
                <ReferenceArea y1={14.0} y2={15} fill="hsl(0, 72%, 55%)" fillOpacity={0.08} />
                <ReferenceArea y1={10} y2={11.0} fill="hsl(0, 72%, 55%)" fillOpacity={0.08} />
                <ReferenceArea y1={13.5} y2={14.0} fill="hsl(38, 92%, 50%)" fillOpacity={0.08} />
                <ReferenceArea y1={11.0} y2={11.5} fill="hsl(38, 92%, 50%)" fillOpacity={0.08} />
                <ReferenceArea y1={11.5} y2={13.5} fill="hsl(145, 65%, 42%)" fillOpacity={0.06} />
                <ReferenceLine y={12.5} stroke="hsl(210, 100%, 50%)" strokeDasharray="2 4" strokeWidth={1.5} label={{ value: "Target", position: "right", fill: "hsl(210, 100%, 50%)", fontSize: 9 }} />
                <ReferenceLine y={14.0} stroke="hsl(0, 72%, 55%)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "USL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 9 }} />
                <ReferenceLine y={11.0} stroke="hsl(0, 72%, 55%)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "LSL", position: "right", fill: "hsl(0, 72%, 55%)", fontSize: 9 }} />
                <ReferenceLine y={13.5} stroke="hsl(38, 92%, 50%)" strokeWidth={1.5} label={{ value: "UCL", position: "right", fill: "hsl(38, 92%, 50%)", fontSize: 9 }} />
                <ReferenceLine y={11.5} stroke="hsl(38, 92%, 50%)" strokeWidth={1.5} label={{ value: "LCL", position: "right", fill: "hsl(38, 92%, 50%)", fontSize: 9 }} />
                <Line type="monotone" dataKey="moisture" stroke="hsl(170, 70%, 45%)" strokeWidth={2} dot={{ r: 2.5, fill: "hsl(170, 70%, 45%)", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--foreground))" }} />
              </LineChart>
            </ResponsiveContainer>
            {periodSelector}
          </motion.div>

          {/* Process Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Detailed Data</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search…" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="h-8 text-xs pl-8 w-[180px] bg-card" />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportCSV}><Download className="h-3.5 w-3.5" />CSV</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportCSV}><Download className="h-3.5 w-3.5" />Excel</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3 text-xs">Timestamp</th>
                    <th className="text-left py-2 px-3 text-xs">Parameter</th>
                    <th className="text-right py-2 px-3 text-xs">Value</th>
                    <th className="text-right py-2 px-3 text-xs">LSL</th>
                    <th className="text-right py-2 px-3 text-xs">USL</th>
                    <th className="text-left py-2 px-3 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedData as typeof processTableData).map((d, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{(d as any).timestamp}</td>
                      <td className="py-2.5 px-3 text-xs font-medium">{(d as any).parameter}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).value}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).lsl}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).usl}</td>
                      <td className="py-2.5 px-3 text-xs">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${(d as any).status === "Normal" ? "status-normal" : (d as any).status === "Critical" ? "status-critical" : "status-warning"}`}>
                          {(d as any).status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages} ({currentTableData.length} records)</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* === ALERTS REPORT === */}
        <TabsContent value="alerts" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Alerts", value: alertKpis.total, icon: <Eye className="h-5 w-5 text-primary" />, bg: "bg-primary/10" },
              { label: "Critical", value: alertKpis.critical, icon: <XCircle className="h-5 w-5 text-critical" />, bg: "bg-critical/10" },
              { label: "Warning", value: alertKpis.warning, icon: <AlertTriangle className="h-5 w-5 text-warning" />, bg: "bg-warning/10" },
              { label: "Acknowledged", value: alertKpis.acknowledged, icon: <CheckCircle className="h-5 w-5 text-success" />, bg: "bg-success/10" },
            ].map((c) => (
              <div key={c.label} className="kpi-card flex items-center gap-3">
                <div className={`p-2 rounded-md ${c.bg}`}>{c.icon}</div>
                <div>
                  <div className="text-2xl font-bold mono">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts severity bar chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
            <h3 className="text-sm font-semibold mb-3">Alerts by Severity & Line</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={lines.filter((l) => l !== "All").map((line) => ({
                line,
                critical: alertsData.filter((a) => a.productionLine === line && a.severity === "Critical").length,
                warning: alertsData.filter((a) => a.productionLine === line && a.severity === "Warning").length,
              }))} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="line" stroke={axisStroke} tick={{ fontSize: 11 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} allowDecimals={false} />
                <ReTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="critical" fill="hsl(0, 72%, 55%)" name="Critical" radius={[3, 3, 0, 0]} />
                <Bar dataKey="warning" fill="hsl(38, 92%, 50%)" name="Warning" radius={[3, 3, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
            {periodSelector}
          </motion.div>

          {/* Alerts Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Alert Details</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search…" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="h-8 text-xs pl-8 w-[180px] bg-card" />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportCSV}><Download className="h-3.5 w-3.5" />CSV</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3 text-xs">ID</th>
                    <th className="text-left py-2 px-3 text-xs">Timestamp</th>
                    <th className="text-left py-2 px-3 text-xs">Equipment</th>
                    <th className="text-left py-2 px-3 text-xs">Line</th>
                    <th className="text-left py-2 px-3 text-xs">Parameter</th>
                    <th className="text-left py-2 px-3 text-xs">Severity</th>
                    <th className="text-left py-2 px-3 text-xs">Value</th>
                    <th className="text-left py-2 px-3 text-xs">Threshold</th>
                    <th className="text-left py-2 px-3 text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedData as typeof alertsTableData).map((d, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{(d as any).id}</td>
                      <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{(d as any).timestamp}</td>
                      <td className="py-2.5 px-3 text-xs font-medium">{(d as any).equipment}</td>
                      <td className="py-2.5 px-3 text-xs">{(d as any).line}</td>
                      <td className="py-2.5 px-3 text-xs">{(d as any).parameter}</td>
                      <td className="py-2.5 px-3 text-xs">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${(d as any).severity === "Critical" ? "status-critical" : "status-warning"}`}>
                          {(d as any).severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 mono text-xs">{(d as any).value}</td>
                      <td className="py-2.5 px-3 mono text-xs">{(d as any).threshold}</td>
                      <td className="py-2.5 px-3 text-xs">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${(d as any).status === "Acknowledged" ? "status-normal" : "status-critical"}`}>
                          {(d as any).status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages} ({currentTableData.length} records)</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* === PRODUCTION REPORT === */}
        <TabsContent value="production" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Production Data</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search…" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="h-8 text-xs pl-8 w-[180px] bg-card" />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportPDF} disabled={exporting}>
                  {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}PDF
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportExcel} disabled={exporting}>
                  {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}Excel
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3 text-xs">Timestamp</th>
                    <th className="text-left py-2 px-3 text-xs">Unit</th>
                    <th className="text-left py-2 px-3 text-xs">Line</th>
                    <th className="text-left py-2 px-3 text-xs">Machine</th>
                    <th className="text-right py-2 px-3 text-xs">Production</th>
                    <th className="text-right py-2 px-3 text-xs">Consumption (kWh)</th>
                    <th className="text-right py-2 px-3 text-xs">Energy/Unit</th>
                    <th className="text-right py-2 px-3 text-xs">Moisture (%)</th>
                    <th className="text-right py-2 px-3 text-xs">Humidity (% RH)</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedData as typeof productionTableData).map((d, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{(d as any).timestamp}</td>
                      <td className="py-2.5 px-3 text-xs">{(d as any).unit}</td>
                      <td className="py-2.5 px-3 text-xs">{(d as any).line}</td>
                      <td className="py-2.5 px-3 text-xs font-medium">{(d as any).machine}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).production}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).consumption?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).energyPerUnit}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).moisture}</td>
                      <td className="py-2.5 px-3 text-xs mono text-right">{(d as any).humidity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages} ({currentTableData.length} records)</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            {periodSelector}
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ReportsPage;
