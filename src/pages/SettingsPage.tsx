import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Gauge, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl space-y-6">
        {/* General */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container space-y-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">General Settings</h3>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Plant Name</Label>
              <Input defaultValue="VST Industry - Plant A" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Data Refresh Interval</Label>
              <Input defaultValue="30" type="number" />
            </div>
          </div>
        </motion.div>

        {/* Alert Thresholds */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Process Thresholds</h3>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2"><Label className="text-xs">Moisture Target (%)</Label><Input defaultValue="12.5" type="number" step="0.1" /></div>
            <div className="space-y-2"><Label className="text-xs">Moisture LSL (%)</Label><Input defaultValue="11.0" type="number" step="0.1" /></div>
            <div className="space-y-2"><Label className="text-xs">Moisture USL (%)</Label><Input defaultValue="14.0" type="number" step="0.1" /></div>
            <div className="space-y-2"><Label className="text-xs">Humidity Target (% RH)</Label><Input defaultValue="58" type="number" /></div>
            <div className="space-y-2"><Label className="text-xs">Humidity LSL (% RH)</Label><Input defaultValue="50" type="number" /></div>
            <div className="space-y-2"><Label className="text-xs">Humidity USL (% RH)</Label><Input defaultValue="65" type="number" /></div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="chart-container space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          <Separator />
          <div className="space-y-3">
            {["Critical alerts via email", "Warning alerts via email", "Daily energy report", "Weekly performance summary"].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <Label className="text-sm">{item}</Label>
                <Switch defaultChecked={item.includes("Critical")} />
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
