import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { alertsData } from "@/data/mockData";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === "Critical") return <XCircle className="h-4 w-4 text-critical" />;
  if (severity === "Warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
  return <CheckCircle className="h-4 w-4 text-success" />;
};

const AlertRow = ({ alert }: { alert: typeof alertsData[0] }) => (
  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`p-4 rounded-lg border ${alert.severity === "Critical" ? "border-critical/30 bg-critical/5" : alert.severity === "Warning" ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
    <div className="flex items-start gap-3">
      <SeverityIcon severity={alert.severity} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-medium text-sm">{alert.message}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${alert.severity === "Critical" ? "status-critical" : alert.severity === "Warning" ? "status-warning" : "status-normal"}`}>
            {alert.severity}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="mono">{alert.id}</span>
          <span>{alert.productionLine}</span>
          <span>{alert.parameter}</span>
          <span className="mono">{alert.timestamp}</span>
          {alert.acknowledged && <span className="text-success">✓ Acknowledged</span>}
        </div>
      </div>
    </div>
  </motion.div>
);

const AlertsPage = () => {
  const critical = alertsData.filter((a) => a.severity === "Critical");
  const warnings = alertsData.filter((a) => a.severity === "Warning");

  return (
    <DashboardLayout title="Alerts Management">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card flex items-center gap-3">
          <div className="p-2 rounded-md bg-critical/10"><XCircle className="h-5 w-5 text-critical" /></div>
          <div>
            <div className="text-2xl font-bold mono">{critical.length}</div>
            <div className="text-xs text-muted-foreground">Critical Alerts</div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="p-2 rounded-md bg-warning/10"><AlertTriangle className="h-5 w-5 text-warning" /></div>
          <div>
            <div className="text-2xl font-bold mono">{warnings.length}</div>
            <div className="text-xs text-muted-foreground">Warning Alerts</div>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="p-2 rounded-md bg-success/10"><CheckCircle className="h-5 w-5 text-success" /></div>
          <div>
            <div className="text-2xl font-bold mono">{alertsData.filter((a) => a.acknowledged).length}</div>
            <div className="text-xs text-muted-foreground">Acknowledged</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">All ({alertsData.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({critical.length})</TabsTrigger>
          <TabsTrigger value="warning">Warning ({warnings.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-3">
          {alertsData.map((alert) => <AlertRow key={alert.id} alert={alert} />)}
        </TabsContent>
        <TabsContent value="critical" className="space-y-3">
          {critical.map((alert) => <AlertRow key={alert.id} alert={alert} />)}
        </TabsContent>
        <TabsContent value="warning" className="space-y-3">
          {warnings.map((alert) => <AlertRow key={alert.id} alert={alert} />)}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AlertsPage;
