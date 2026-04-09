import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { alertsData, Alert } from "@/data/mockData";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle, XCircle, Eye, ExternalLink, Clock, User,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const units = ["All", "Unit 1", "Unit 2", "Unit 3", "PMD", "SMD"];
const lines = ["All", "Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];
const machines = ["All", "Compressor A", "Dryer B", "Motor C", "Furnace D", "Pump E", "Conveyor F"];
const parameters = ["All", "Energy", "Moisture", "Humidity"];
const skus = ["All", "Blend A", "Blend B", "Blend C", "SKU-100", "SKU-200"];
const shifts = ["All", "Shift A", "Shift B", "Shift C"];

const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === "Critical") return <XCircle className="h-4 w-4 text-critical" />;
  if (severity === "Warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
  return <CheckCircle className="h-4 w-4 text-success" />;
};

const AlertRow = ({
  alert,
  onAcknowledge,
}: {
  alert: Alert;
  onAcknowledge: (alert: Alert) => void;
}) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-4 rounded-lg border transition-all ${
            alert.acknowledged
              ? "border-border/40 bg-muted/30 opacity-70"
              : alert.severity === "Critical"
              ? "border-critical/30 bg-critical/5"
              : "border-warning/30 bg-warning/5"
          }`}
        >
          <div className="flex items-start gap-3">
            <SeverityIcon severity={alert.severity} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-medium text-sm">{alert.message}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      alert.severity === "Critical"
                        ? "status-critical"
                        : "status-warning"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  {alert.acknowledged ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Acknowledged
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                <span className="mono">{alert.id}</span>
                <span>{alert.equipment || "—"}</span>
                <span>{alert.productionLine}</span>
                <span>{alert.parameter}</span>
                {alert.currentValue != null && (
                  <span className="mono font-medium text-foreground">
                    {alert.currentValue} {alert.unit} / {alert.threshold} {alert.unit}
                  </span>
                )}
                <span className="mono">{alert.timestamp}</span>
                {alert.parameter === "Energy" && alert.costImpact != null && alert.costImpact > 0 && (
                  <span className="text-warning font-medium">₹{alert.costImpact.toLocaleString()}</span>
                )}
              </div>
              {alert.acknowledged && alert.acknowledgedBy && (
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{alert.acknowledgedBy}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{alert.acknowledgedAt}</span>
                  {alert.acknowledgedComment && (
                    <span className="italic">"{alert.acknowledgedComment}"</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!alert.acknowledged && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcknowledge(alert);
                  }}
                >
                  Acknowledge
                </Button>
              )}
              {alert.parameter === "Energy" && (
                <Button size="icon" variant="ghost" className="h-7 w-7" title="View in Energy Monitoring">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs space-y-1 p-3">
        <p className="font-semibold">{alert.parameter} — {alert.equipment || alert.productionLine}</p>
        {alert.currentValue != null && (
          <>
            <p>Actual: <span className="mono font-medium">{alert.currentValue} {alert.unit}</span></p>
            <p>Threshold: <span className="mono font-medium">{alert.threshold} {alert.unit}</span></p>
            <p>Deviation: <span className="mono font-medium text-critical">
              {alert.threshold ? ((alert.currentValue - alert.threshold)).toFixed(1) : "—"} {alert.unit}
            </span></p>
          </>
        )}
        <p>Time: {alert.timestamp}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>(alertsData);
  const [ackAlert, setAckAlert] = useState<Alert | null>(null);
  const [ackComment, setAckComment] = useState("");

  // Filters
  const [filterLine, setFilterLine] = useState("All");
  const [filterMachine, setFilterMachine] = useState("All");
  const [filterParam, setFilterParam] = useState("All");
  const [filterShift, setFilterShift] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "acknowledged">("all");
  const [severityTab, setSeverityTab] = useState("all");

  const filtered = useMemo(() => {
    let list = alerts;
    if (filterLine !== "All") list = list.filter((a) => a.productionLine === filterLine);
    if (filterMachine !== "All") list = list.filter((a) => a.equipment === filterMachine);
    if (filterParam !== "All") list = list.filter((a) => a.parameter === filterParam);
    if (statusFilter === "active") list = list.filter((a) => !a.acknowledged);
    if (statusFilter === "acknowledged") list = list.filter((a) => a.acknowledged);
    if (severityTab === "critical") list = list.filter((a) => a.severity === "Critical");
    if (severityTab === "warning") list = list.filter((a) => a.severity === "Warning");
    return list;
  }, [alerts, filterLine, filterMachine, filterParam, filterShift, statusFilter, severityTab]);

  const kpi = useMemo(() => ({
    total: filtered.length,
    critical: filtered.filter((a) => a.severity === "Critical").length,
    warning: filtered.filter((a) => a.severity === "Warning").length,
    acknowledged: filtered.filter((a) => a.acknowledged).length,
  }), [filtered]);

  const handleAcknowledge = () => {
    if (!ackAlert || !ackComment.trim()) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === ackAlert.id
          ? {
              ...a,
              acknowledged: true,
              acknowledgedBy: "Current User",
              acknowledgedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              acknowledgedComment: ackComment.trim(),
            }
          : a
      )
    );
    setAckAlert(null);
    setAckComment("");
  };

  return (
    <DashboardLayout title="Alerts Management">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {[
          { label: "Line", value: filterLine, setter: setFilterLine, opts: lines },
          { label: "Machine", value: filterMachine, setter: setFilterMachine, opts: machines },
          { label: "Parameter", value: filterParam, setter: setFilterParam, opts: parameters },
          { label: "Shift", value: filterShift, setter: setFilterShift, opts: shifts },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[180px]">
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
        <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="h-9 text-sm bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Alerts", value: kpi.total, icon: <Eye className="h-5 w-5 text-primary" />, bg: "bg-primary/10" },
          { label: "Critical", value: kpi.critical, icon: <XCircle className="h-5 w-5 text-critical" />, bg: "bg-critical/10" },
          { label: "Warning", value: kpi.warning, icon: <AlertTriangle className="h-5 w-5 text-warning" />, bg: "bg-warning/10" },
          { label: "Acknowledged", value: kpi.acknowledged, icon: <CheckCircle className="h-5 w-5 text-success" />, bg: "bg-success/10" },
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

      {/* Severity Tabs + Alert List */}
      <Tabs value={severityTab} onValueChange={setSeverityTab} className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({alerts.filter((a) => a.severity === "Critical").length})</TabsTrigger>
          <TabsTrigger value="warning">Warning ({alerts.filter((a) => a.severity === "Warning").length})</TabsTrigger>
        </TabsList>
        {["all", "critical", "warning"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No alerts match filters</div>
            ) : (
              filtered.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onAcknowledge={setAckAlert} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Acknowledge Modal */}
      <Dialog open={!!ackAlert} onOpenChange={(open) => !open && setAckAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Alert</DialogTitle>
            <DialogDescription>
              {ackAlert?.id} — {ackAlert?.message}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Equipment:</span> {ackAlert?.equipment}</div>
              <div><span className="text-muted-foreground">Line:</span> {ackAlert?.productionLine}</div>
              <div><span className="text-muted-foreground">Value:</span> {ackAlert?.currentValue} {ackAlert?.unit}</div>
              <div><span className="text-muted-foreground">Threshold:</span> {ackAlert?.threshold} {ackAlert?.unit}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Comment <span className="text-destructive">*</span></label>
              <Textarea
                placeholder="Enter acknowledgement comment…"
                value={ackComment}
                onChange={(e) => setAckComment(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAckAlert(null)}>Cancel</Button>
            <Button onClick={handleAcknowledge} disabled={!ackComment.trim()}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AlertsPage;
