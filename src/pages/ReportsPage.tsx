import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  energyTrendData, equipmentEnergyData, processData, alertsData,
} from "@/data/mockData";
import {
  Download, FileText, CalendarIcon, Search,
  ChevronLeft, ChevronRight, FileSpreadsheet, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const units = ["All", "Unit 1", "Unit 2", "Unit 3", "PMD", "SMD"];
const lines = ["All", "Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];
const machines = ["All", "Compressor A", "Dryer B", "Motor C", "Furnace D", "Pump E", "Conveyor F"];
const parameters = ["All", "Energy", "Moisture", "Humidity"];
const skus = ["All", "Blend A", "Blend B", "Blend C", "SKU-100", "SKU-200"];
const shifts = ["All", "Shift A", "Shift B", "Shift C"];

type ReportType = "energy" | "process" | "alerts" | "production";
type PeriodOption = "today" | "yesterday" | "7days" | "30days" | "month" | "custom";

const periodLabels: Record<PeriodOption, string> = {
  today: "Today", yesterday: "Yesterday", "7days": "Last 7 Days",
  "30days": "Last 30 Days", month: "This Month", custom: "Custom Range",
};

const PAGE_SIZE = 10;

const ReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>("energy");
  const [period, setPeriod] = useState<PeriodOption>("today");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const [filterUnit, setFilterUnit] = useState("All");
  const [filterLine, setFilterLine] = useState("All");
  const [filterMachine, setFilterMachine] = useState("All");
  const [filterParam, setFilterParam] = useState("All");
  const [filterSku, setFilterSku] = useState("All");
  const [filterShift, setFilterShift] = useState("All");

  // Energy table data
  const energyTableData = useMemo(() => {
    let data = equipmentEnergyData.map((eq) => ({
      timestamp: "2026-03-10 14:00",
      machine: eq.equipment,
      line: eq.line,
      consumption: eq.consumption,
      cost: eq.cost,
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
      timestamp: a.timestamp,
      parameter: a.parameter,
      severity: a.severity,
      status: a.acknowledged ? "Acknowledged" : "Active",
      comment: a.acknowledgedComment || "—",
    }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((d) => d.parameter.toLowerCase().includes(q) || d.severity.toLowerCase().includes(q));
    }
    return data;
  }, [searchQuery]);

  // Production table data
  const productionTableData = useMemo(() => {
    let data = energyTrendData.map((d, i) => ({
      timestamp: `2026-03-10 ${d.time}`,
      production: Math.round(180 + Math.random() * 40),
      consumption: d.actual,
      energyPerUnit: +(d.actual / (180 + i * 0.5)).toFixed(2),
    }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((d) => d.timestamp.toLowerCase().includes(q));
    }
    return data;
  }, [searchQuery]);

  const currentTableData = reportType === "energy" ? energyTableData : reportType === "process" ? processTableData : reportType === "production" ? productionTableData : alertsTableData;
  const totalPages = Math.max(1, Math.ceil(currentTableData.length / PAGE_SIZE));
  const pagedData = currentTableData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getFileName = useCallback(() => {
    const typeLabel = reportType.charAt(0).toUpperCase() + reportType.slice(1);
    const unitPart = filterUnit !== "All" ? `_${filterUnit.replace(/\s/g, "")}` : "";
    const linePart = filterLine !== "All" ? `_${filterLine.replace(/\s/g, "")}` : "";
    const datePart = `_${format(new Date(), "yyyyMMdd")}`;
    return `${typeLabel}Report${unitPart}${linePart}${datePart}`;
  }, [reportType, filterUnit, filterLine]);

  const buildCSVContent = useCallback(() => {
    if (reportType === "energy") {
      return ["Timestamp,Machine,Line,Consumption (kWh),Cost (₹)", ...energyTableData.map((d) => `${d.timestamp},${d.machine},${d.line},${d.consumption},${d.cost}`)].join("\n");
    } else if (reportType === "process") {
      return ["Timestamp,Parameter,Value,LSL,USL,Status", ...processTableData.map((d) => `${d.timestamp},${d.parameter},${d.value},${d.lsl},${d.usl},${d.status}`)].join("\n");
    } else if (reportType === "production") {
      return ["Timestamp,Production (units),Consumption (kWh),Energy/Unit", ...productionTableData.map((d) => `${d.timestamp},${d.production},${d.consumption},${d.energyPerUnit}`)].join("\n");
    } else {
      return ["Timestamp,Parameter,Severity,Status,Comment", ...alertsTableData.map((d) => `${d.timestamp},${d.parameter},${d.severity},${d.status},${d.comment}`)].join("\n");
    }
  }, [reportType, energyTableData, processTableData, alertsTableData, productionTableData]);

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
      const csvLines = csv.split("\n");
      const header = csvLines[0];
      const content = `${reportType.toUpperCase()} REPORT\n\nFilters: Unit=${filterUnit}, Line=${filterLine}, Machine=${filterMachine}, SKU=${filterSku}, Shift=${filterShift}, Period=${periodLabels[period]}\nGenerated: ${format(new Date(), "dd MMM yyyy HH:mm")}\n\n${header}\n${"─".repeat(80)}\n${csvLines.slice(1).join("\n")}`;
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

  // Shared table renderer
  const renderTable = (headers: { label: string; align?: string }[], renderRow: (d: any, i: number) => React.ReactNode) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold">Detailed Data</h3>
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
              {headers.map((h) => (
                <th key={h.label} className={cn("py-2 px-3 text-xs", h.align === "right" ? "text-right" : "text-left")}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((d, i) => renderRow(d, i))}
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
  );

  return (
    <DashboardLayout title="Reports">
      {/* Filter Bar with Period */}
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
        {/* Period filter in top bar */}
        <div className="flex flex-col gap-1 min-w-[130px] flex-1 max-w-[170px]">
          <label className="text-xs font-medium text-muted-foreground">Period</label>
          <Select value={period} onValueChange={(v) => { setPeriod(v as PeriodOption); setPage(1); }}>
            <SelectTrigger className="h-9 text-sm bg-card border-border">
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
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 text-sm w-[150px] justify-start", !startDate && "text-muted-foreground")}>
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
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 text-sm w-[150px] justify-start", !endDate && "text-muted-foreground")}>
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

      {/* Report Type Tabs */}
      <Tabs value={reportType} onValueChange={(v) => { setReportType(v as ReportType); setPage(1); setSearchQuery(""); }} className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="energy">Energy Reports</TabsTrigger>
          <TabsTrigger value="process">Process (SPC) Reports</TabsTrigger>
          <TabsTrigger value="alerts">Alerts Reports</TabsTrigger>
          <TabsTrigger value="production">Production Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="energy">
          {renderTable(
            [{ label: "Timestamp" }, { label: "Machine" }, { label: "Line" }, { label: "Consumption (kWh)", align: "right" }, { label: "Cost (₹)", align: "right" }],
            (d: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{d.timestamp}</td>
                <td className="py-2.5 px-3 text-xs font-medium">{d.machine}</td>
                <td className="py-2.5 px-3 text-xs">{d.line}</td>
                <td className="py-2.5 px-3 text-xs mono text-right">{d.consumption?.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-xs mono text-right">₹{d.cost?.toLocaleString()}</td>
              </tr>
            )
          )}
        </TabsContent>

        <TabsContent value="process">
          {renderTable(
            [{ label: "Timestamp" }, { label: "Parameter" }, { label: "Value", align: "right" }, { label: "LSL", align: "right" }, { label: "USL", align: "right" }, { label: "Status" }],
            (d: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{d.timestamp}</td>
                <td className="py-2.5 px-3 text-xs font-medium">{d.parameter}</td>
                <td className="py-2.5 px-3 text-xs mono text-right">{d.value}</td>
                <td className="py-2.5 px-3 text-xs mono text-right">{d.lsl}</td>
                <td className="py-2.5 px-3 text-xs mono text-right">{d.usl}</td>
                <td className="py-2.5 px-3 text-xs">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", d.status === "Normal" ? "status-normal" : d.status === "Critical" ? "status-critical" : "status-warning")}>{d.status}</span>
                </td>
              </tr>
            )
          )}
        </TabsContent>

        <TabsContent value="alerts">
          {renderTable(
            [{ label: "Timestamp" }, { label: "Parameter" }, { label: "Severity" }, { label: "Status" }, { label: "Comment" }],
            (d: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{d.timestamp}</td>
                <td className="py-2.5 px-3 text-xs font-medium">{d.parameter}</td>
                <td className="py-2.5 px-3 text-xs">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", d.severity === "Critical" ? "status-critical" : "status-warning")}>{d.severity}</span>
                </td>
                <td className="py-2.5 px-3 text-xs">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", d.status === "Acknowledged" ? "status-normal" : "status-critical")}>{d.status}</span>
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{d.comment}</td>
              </tr>
            )
          )}
        </TabsContent>

        <TabsContent value="production">
          {renderTable(
            [{ label: "Timestamp" }, { label: "Output", align: "right" }, { label: "Energy (kWh)", align: "right" }, { label: "Energy/Unit", align: "right" }],
            (d: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-2.5 px-3 mono text-xs text-muted-foreground">{d.timestamp}</td>
                <td className="py-2.5 px-3 text-xs mono text-right">{d.production}</td>
                <td className="py-2.5 px-3 text-xs mono text-right">{d.consumption?.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-xs mono text-right">{d.energyPerUnit}</td>
              </tr>
            )
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ReportsPage;
