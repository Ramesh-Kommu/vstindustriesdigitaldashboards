import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const reportHistory = [
  { id: "RPT-001", name: "Daily Energy Consumption", date: "2026-03-10", type: "Energy", status: "Ready" },
  { id: "RPT-002", name: "Weekly Process Analysis", date: "2026-03-09", type: "Process", status: "Ready" },
  { id: "RPT-003", name: "Monthly Performance Summary", date: "2026-03-01", type: "Performance", status: "Ready" },
  { id: "RPT-004", name: "Energy Efficiency Report", date: "2026-02-28", type: "Energy", status: "Ready" },
  { id: "RPT-005", name: "Moisture & Humidity Analysis", date: "2026-02-25", type: "Process", status: "Ready" },
  { id: "RPT-006", name: "Alert Summary Report", date: "2026-02-20", type: "Alerts", status: "Ready" },
];

const ReportsPage = () => {
  const [dateFilter, setDateFilter] = useState("all");
  const [lineFilter, setLineFilter] = useState("all");
  const [paramFilter, setParamFilter] = useState("all");

  return (
    <DashboardLayout title="Reports">
      {/* Report Generation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
        <h3 className="text-sm font-semibold mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger><Calendar className="h-4 w-4 mr-2" /><SelectValue placeholder="Date Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lineFilter} onValueChange={setLineFilter}>
            <SelectTrigger><SelectValue placeholder="Production Line" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              <SelectItem value="line1">Line 1</SelectItem>
              <SelectItem value="line2">Line 2</SelectItem>
              <SelectItem value="line3">Line 3</SelectItem>
              <SelectItem value="line4">Line 4</SelectItem>
              <SelectItem value="line5">Line 5</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paramFilter} onValueChange={setParamFilter}>
            <SelectTrigger><SelectValue placeholder="Parameter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parameters</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="moisture">Moisture</SelectItem>
              <SelectItem value="humidity">Humidity</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button className="flex-1"><Download className="h-4 w-4 mr-2" />PDF</Button>
            <Button variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" />Excel</Button>
          </div>
        </div>
      </motion.div>

      {/* Report History */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
        <h3 className="text-sm font-semibold mb-4">Report History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-3">Report ID</th>
                <th className="text-left py-2 px-3">Report Name</th>
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportHistory.map((report) => (
                <tr key={report.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-3 mono text-muted-foreground">{report.id}</td>
                  <td className="py-3 px-3 font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />{report.name}</td>
                  <td className="py-3 px-3 mono text-muted-foreground">{report.date}</td>
                  <td className="py-3 px-3"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{report.type}</span></td>
                  <td className="py-3 px-3"><span className="status-normal text-xs px-2 py-0.5 rounded-full border">{report.status}</span></td>
                  <td className="py-3 px-3 text-right">
                    <Button variant="ghost" size="sm"><Download className="h-3 w-3" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ReportsPage;
