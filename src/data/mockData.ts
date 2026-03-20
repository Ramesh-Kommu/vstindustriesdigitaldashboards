// Sample sensor data structure and mock data for VST Industry Digital Factory

export interface SensorReading {
  tagName: string;
  tagValue: number;
  timestamp: string;
  productionLine: string;
  parameterType: "Energy" | "Moisture" | "Humidity";
  unit: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  productionLine: string;
  parameter: "Energy" | "Moisture" | "Humidity";
  severity: "Critical" | "Warning" | "Normal";
  message: string;
  acknowledged: boolean;
}

export interface EnergyData {
  time: string;
  actual: number;
  target: number;
}

export interface ProcessData {
  time: string;
  moisture: number;
  humidity: number;
  moistureTarget: number;
  moistureLSL: number;
  moistureUSL: number;
  humidityTarget: number;
  humidityLSL: number;
  humidityUSL: number;
}

export const kpiData = {
  totalEnergy: 12480,
  gridElectricity: 7890,
  solarEnergy: 3240,
  dieselGenerator: 1350,
  energyCost: 186720,
  productionOutput: 4520,
  energyPerUnit: 2.76,
  avgMoisture: 12.4,
  avgHumidity: 58.2,
  activeAlerts: 7,
  criticalAlerts: 2,
  warningAlerts: 5,
};

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

export const energyTrendData: EnergyData[] = hours.map((time, i) => {
  const target = 350;
  const actual = 300 + Math.random() * 120 + (i >= 8 && i <= 18 ? 40 : 0);
  return { time, actual: +actual.toFixed(1), target };
});

export const lineEnergyData = [
  { line: "Line 1", consumption: 3420, efficiency: 92 },
  { line: "Line 2", consumption: 2890, efficiency: 88 },
  { line: "Line 3", consumption: 3150, efficiency: 95 },
  { line: "Line 4", consumption: 1780, efficiency: 84 },
  { line: "Line 5", consumption: 1240, efficiency: 91 },
];

export const equipmentEnergyData = [
  { equipment: "Compressor A", line: "Line 1", consumption: 890, cost: 7120, status: "Running" },
  { equipment: "Dryer B", line: "Line 1", consumption: 650, cost: 5200, status: "Running" },
  { equipment: "Motor C", line: "Line 2", consumption: 1120, cost: 8960, status: "Running" },
  { equipment: "Furnace D", line: "Line 3", consumption: 1540, cost: 12320, status: "Idle" },
  { equipment: "Pump E", line: "Line 4", consumption: 320, cost: 2560, status: "Running" },
  { equipment: "Conveyor F", line: "Line 5", consumption: 210, cost: 1680, status: "Maintenance" },
];

export const processData: ProcessData[] = Array.from({ length: 50 }, (_, i) => ({
  time: `Sample ${i + 1}`,
  moisture: 11.5 + Math.random() * 2,
  humidity: 55 + Math.random() * 8,
  moistureTarget: 12.5,
  moistureLSL: 11.0,
  moistureUSL: 14.0,
  humidityTarget: 58,
  humidityLSL: 50,
  humidityUSL: 65,
}));

export const moistureByLine = [
  { line: "Line 1", current: 12.3, target: 12.5, status: "Normal" as const },
  { line: "Line 2", current: 13.8, target: 12.5, status: "Warning" as const },
  { line: "Line 3", current: 12.1, target: 12.5, status: "Normal" as const },
  { line: "Line 4", current: 14.2, target: 12.5, status: "Critical" as const },
  { line: "Line 5", current: 12.6, target: 12.5, status: "Normal" as const },
];

export const humidityByLine = [
  { line: "Line 1", current: 57.2, target: 58, status: "Normal" as const },
  { line: "Line 2", current: 62.1, target: 58, status: "Warning" as const },
  { line: "Line 3", current: 56.8, target: 58, status: "Normal" as const },
  { line: "Line 4", current: 66.5, target: 58, status: "Critical" as const },
  { line: "Line 5", current: 58.3, target: 58, status: "Normal" as const },
];

export const alertsData: Alert[] = [
  { id: "ALT-001", timestamp: "2026-03-10 14:32:00", productionLine: "Line 4", parameter: "Moisture", severity: "Critical", message: "Moisture level exceeded USL (14.0%). Current: 14.2%", acknowledged: false },
  { id: "ALT-002", timestamp: "2026-03-10 14:28:00", productionLine: "Line 4", parameter: "Humidity", severity: "Critical", message: "Humidity exceeded USL (65%). Current: 66.5%", acknowledged: false },
  { id: "ALT-003", timestamp: "2026-03-10 13:45:00", productionLine: "Line 2", parameter: "Moisture", severity: "Warning", message: "Moisture approaching USL. Current: 13.8%", acknowledged: false },
  { id: "ALT-004", timestamp: "2026-03-10 13:20:00", productionLine: "Line 2", parameter: "Humidity", severity: "Warning", message: "Humidity above target. Current: 62.1%", acknowledged: true },
  { id: "ALT-005", timestamp: "2026-03-10 12:15:00", productionLine: "Line 1", parameter: "Energy", severity: "Warning", message: "Energy spike detected on Compressor A", acknowledged: true },
  { id: "ALT-006", timestamp: "2026-03-10 11:00:00", productionLine: "Line 3", parameter: "Energy", severity: "Warning", message: "Furnace D idle but consuming power", acknowledged: false },
  { id: "ALT-007", timestamp: "2026-03-10 09:30:00", productionLine: "Line 5", parameter: "Energy", severity: "Warning", message: "Conveyor F scheduled maintenance overdue", acknowledged: true },
];

export const weeklyEnergyData = [
  { day: "Mon", actual: 11100, target: 10500 },
  { day: "Tue", actual: 11500, target: 10500 },
  { day: "Wed", actual: 12480, target: 10500 },
  { day: "Thu", actual: 10900, target: 10500 },
  { day: "Fri", actual: 11650, target: 10500 },
  { day: "Sat", actual: 7200, target: 7000 },
  { day: "Sun", actual: 5700, target: 5500 },
];

export const monthlyEnergyData = [
  { month: "Jan", total: 340000 },
  { month: "Feb", total: 310000 },
  { month: "Mar", total: 365000 },
  { month: "Apr", total: 345000 },
  { month: "May", total: 380000 },
  { month: "Jun", total: 395000 },
];
