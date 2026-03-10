import DashboardLayout from "@/components/DashboardLayout";
import { energyTrendData, lineEnergyData, equipmentEnergyData, weeklyEnergyData, monthlyEnergyData } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["hsl(260, 60%, 55%)", "hsl(48, 96%, 53%)", "hsl(25, 95%, 53%)"];

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 14%, 22%)", borderRadius: 8, fontSize: 12 };
const gridStroke = "hsl(220, 14%, 22%)";
const axisStroke = "hsl(215, 15%, 55%)";

const EnergyMonitoring = () => {
  const energySourceData = [
    { name: "Grid", value: 7890 },
    { name: "Solar", value: 3240 },
    { name: "Diesel", value: 1350 },
  ];

  return (
    <DashboardLayout title="Energy Monitoring & Efficiency">
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="comparison">Line Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chart-container lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4">Real-Time Energy Consumption (kWh)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={energyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="total" stroke="hsl(210, 100%, 50%)" strokeWidth={2} dot={false} name="Total" />
                  <Line type="monotone" dataKey="grid" stroke="hsl(260, 60%, 55%)" strokeWidth={1.5} dot={false} name="Grid" />
                  <Line type="monotone" dataKey="solar" stroke="hsl(48, 96%, 53%)" strokeWidth={1.5} dot={false} name="Solar" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="chart-container">
              <h3 className="text-sm font-semibold mb-4">Energy Source Mix</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={energySourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {energySourceData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
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
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentEnergyData.map((eq) => (
                    <tr key={eq.equipment} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-medium">{eq.equipment}</td>
                      <td className="py-2 px-3 text-muted-foreground">{eq.line}</td>
                      <td className="py-2 px-3 text-right mono">{eq.consumption}</td>
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
              <h3 className="text-sm font-semibold mb-4">Weekly Energy by Source</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyEnergyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="day" stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="grid" stackId="a" fill="hsl(260, 60%, 55%)" name="Grid" />
                  <Bar dataKey="solar" stackId="a" fill="hsl(48, 96%, 53%)" name="Solar" />
                  <Bar dataKey="diesel" stackId="a" fill="hsl(25, 95%, 53%)" name="Diesel" />
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
