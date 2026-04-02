import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Gauge, Shield, Zap, Package, Upload, Plus, Trash2, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const SettingsPage = () => {
  const [skuList, setSkuList] = useState(["Blend A","Blend B","Blend C","SKU-100","SKU-200"]);
  const [newSku, setNewSku] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSku = () => {
    const trimmed = newSku.trim();
    if (!trimmed) return;
    setSkuList([...skuList, trimmed]);
    setNewSku("");
    toast.success(`Added "${trimmed}"`);
  };

  const deleteSku = (index: number) => {
    setSkuList(skuList.filter((_, i) => i !== index));
    toast.info("SKU removed");
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(skuList[index]);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...skuList];
    updated[editingIndex] = editValue.trim();
    setSkuList(updated);
    setEditingIndex(null);
    toast.success("SKU updated");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }
    toast.success(`"${file.name}" uploaded successfully`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted flex-wrap h-auto gap-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sku">SKU / Blend</TabsTrigger>
            <TabsTrigger value="process">Process Params</TabsTrigger>
            <TabsTrigger value="energy">Energy Params</TabsTrigger>
            <TabsTrigger value="upload">Production Upload</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general">
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
                  <Label className="text-xs">Data Refresh Interval (s)</Label>
                  <Input defaultValue="30" type="number" />
                </div>
              </div>
              <div className="flex justify-end"><Button>Save</Button></div>
            </motion.div>
          </TabsContent>

          {/* SKU / Blend Configuration */}
          <TabsContent value="sku">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">SKU / Blend Configuration</h3>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Input placeholder="New SKU / Blend name" value={newSku} onChange={(e) => setNewSku(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSku()} />
                <Button onClick={addSku} size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {skuList.map((sku, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/50">
                    {editingIndex === i ? (
                      <div className="flex gap-2 flex-1 mr-2">
                        <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8" onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                        <Button size="sm" variant="outline" onClick={saveEdit}>Save</Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium">{sku}</span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(i)}><Pencil className="h-3 w-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteSku(i)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Process Parameter Configuration */}
          <TabsContent value="process">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container space-y-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">Process Parameter Configuration</h3>
              </div>
              <Separator />

              {/* Moisture */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Moisture</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Target (%)</Label><Input defaultValue="12.5" type="number" step="0.1" /></div>
                  <div className="space-y-2"><Label className="text-xs">LSL (%)</Label><Input defaultValue="11.0" type="number" step="0.1" /></div>
                  <div className="space-y-2"><Label className="text-xs">USL (%)</Label><Input defaultValue="14.0" type="number" step="0.1" /></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Month-wise Target Override</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {months.map((m) => (
                      <div key={m} className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">{m}</Label>
                        <Input type="number" step="0.1" placeholder="—" className="h-8 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />

              {/* Temperature */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Temperature</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Target (°C)</Label><Input defaultValue="85" type="number" /></div>
                  <div className="space-y-2"><Label className="text-xs">LSL (°C)</Label><Input defaultValue="75" type="number" /></div>
                  <div className="space-y-2"><Label className="text-xs">USL (°C)</Label><Input defaultValue="95" type="number" /></div>
                </div>
              </div>
              <Separator />

              {/* Humidity */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Humidity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label className="text-xs">Target (% RH)</Label><Input defaultValue="58" type="number" /></div>
                  <div className="space-y-2"><Label className="text-xs">LSL (% RH)</Label><Input defaultValue="50" type="number" /></div>
                  <div className="space-y-2"><Label className="text-xs">USL (% RH)</Label><Input defaultValue="65" type="number" /></div>
                </div>
              </div>
              <div className="flex justify-end"><Button>Save Parameters</Button></div>
            </motion.div>
          </TabsContent>

          {/* Energy Parameter Configuration */}
          <TabsContent value="energy">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">Energy Parameter Configuration</h3>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Tariff (₹/kWh)</Label>
                  <Input defaultValue="8.0" type="number" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Unit of Measurement (UOM)</Label>
                  <Select defaultValue="kWh">
                    <SelectTrigger className="h-9 text-sm bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kWh">kWh</SelectItem>
                      <SelectItem value="MWh">MWh</SelectItem>
                      <SelectItem value="GJ">GJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end"><Button>Save Energy Config</Button></div>
            </motion.div>
          </TabsContent>

          {/* Production Data Upload */}
          <TabsContent value="upload">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">Production Data Upload</h3>
              </div>
              <Separator />
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-lg bg-muted/20">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Upload production data file</p>
                <p className="text-xs text-muted-foreground mb-4">Accepted formats: CSV, XLSX, XLS</p>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />Select File
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container space-y-4">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
