import DashboardLayout from "@/components/DashboardLayout";
import { energyTrendData, lineEnergyData, equipmentEnergyData, weeklyEnergyData, monthlyEnergyData } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ASSET_COLORS = [
  "hsl(210, 100%, 50%)", "hsl(145, 65%, 42%)", "hsl(48, 96%, 53%)",
  "hsl(260, 60%, 55%)", "hsl(25, 95%, 53%)", "hsl(340, 75%, 55%)",
];

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

const EnergyMonitoring = () => {
  const totalConsumption = equipmentEnergyData.reduce((sum, eq) => sum + eq.consumption, 0);
  const assetDistributionData = equipmentEnergyData.map((eq) => ({
    name: eq.equipment,
    value: eq.consumption,
    percent: +((eq.consumption / totalConsumption) * 100).toFixed(1),
  }));

  const assetCostData = equipmentEnergyData.map((eq) => ({
    name: eq.equipment,
    value: eq.cost,
  }));

  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) =>
    `${name} ${(percent * 100).toFixed(0)}%`;

  return (
    <DashboardLayout title="Energy Monitoring & Efficiency">
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="comparison">Line Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          {/* Real-Time Trend */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
            <h3 className="text-sm font-semibold mb-4">Real-Time Energy Consumption (kWh)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={energyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: "Date-Time", position: "insideBottom", offset: -2, fontSize: 11, fill: axisStroke }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} label={{ value: "KW", angle: -90, position: "insideLeft", fontSize: 11, fill: axisStroke }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="actual" stroke="hsl(210, 100%, 50%)" strokeWidth={2} dot={false} name="Actual" />
                <Line type="monotone" dataKey="target" stroke="hsl(145, 65%, 42%)" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Target" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Asset-wise Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
              <h3 className="text-sm font-semibold mb-4">Asset-wise Electricity Distribution (kWh & %)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={assetDistributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={renderPieLabel}>
                    {assetDistributionData.map((_, index) => (
                      <Cell key={index} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} kWh`, "Consumption"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="chart-container">
              <h3 className="text-sm font-semibold mb-4">Asset-wise Energy Cost (₹)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={assetCostData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={renderPieLabel}>
                    {assetCostData.map((_, index) => (
                      <Cell key={index} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString()}`, "Cost"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Equipment Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="chart-container">
            <h3 className="text-sm font-semibold mb-4">Equipment Energy Consumption</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3">Equipment</th>
                    <th className="text-left py-2 px-3">Line</th>
                    <th className="text-right py-2 px-3">Consumption (kWh)</th>
                    <th className="text-right py-2 px-3">Cost (₹)</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentEnergyData.map((eq) => (
                    <tr key={eq.equipment} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">{eq.equipment}</td>
                      <td className="py-2 px-3 text-muted-foreground">{eq.line}</td>
                      <td className="py-2 px-3 text-right mono">{eq.consumption}</td>
                      <td className="py-2 px-3 text-right mono">₹{eq.cost.toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${eq.status === "Running" ? "status-normal" : eq.status === "Idle" ? "status-warning" : "status-critical"}`}>
                          {eq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
              <h3 className="text-sm font-semibold mb-4">Line-wise Energy Consumption (kWh)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lineEnergyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="line" stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="consumption" fill="hsl(210, 100%, 50%)" radius={[4, 4, 0, 0]} name="Consumption" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
              <h3 className="text-sm font-semibold mb-4">Line Efficiency (%)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lineEnergyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="line" stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <YAxis domain={[75, 100]} stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="efficiency" fill="hsl(145, 65%, 42%)" radius={[4, 4, 0, 0]} name="Efficiency" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container">
              <h3 className="text-sm font-semibold mb-4">Weekly Energy Consumption</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyEnergyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="day" stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="actual" fill="hsl(210, 100%, 50%)" radius={[4, 4, 0, 0]} name="Actual (kWh)" />
                  <Bar dataKey="target" fill="hsl(145, 65%, 42%)" radius={[4, 4, 0, 0]} name="Target (kWh)" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
              <h3 className="text-sm font-semibold mb-4">Monthly Energy Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyEnergyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="month" stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="total" stroke="hsl(210, 100%, 50%)" strokeWidth={2} dot={{ fill: "hsl(210, 100%, 50%)" }} name="Total kWh" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default EnergyMonitoring;
