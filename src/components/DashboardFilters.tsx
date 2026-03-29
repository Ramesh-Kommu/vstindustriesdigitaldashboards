import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const units = ["Unit 1", "Unit 2", "Unit 3"];
const lines = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];
const machines = ["Compressor A", "Dryer B", "Motor C", "Furnace D", "Pump E", "Conveyor F"];
const parameters = ["Energy", "Moisture", "Humidity", "Temperature"];
const skus = ["Blend A", "Blend B", "Blend C", "SKU-100", "SKU-200"];

interface FilterConfig {
  label: string;
  placeholder: string;
  options: string[];
}

const filters: FilterConfig[] = [
  { label: "Unit Name", placeholder: "Select…", options: units },
  { label: "Line Name", placeholder: "Select…", options: lines },
  { label: "Machine Name", placeholder: "Select…", options: machines },
  { label: "Parameter Name", placeholder: "Select…", options: parameters },
  { label: "SKU / Blend", placeholder: "Select…", options: skus },
];

const DashboardFilters = () => {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {filters.map((filter) => (
        <div key={filter.label} className="flex flex-col gap-1 min-w-[150px] flex-1 max-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">{filter.label}</label>
          <Select>
            <SelectTrigger className="h-9 text-sm bg-card border-border">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
};

export default DashboardFilters;
