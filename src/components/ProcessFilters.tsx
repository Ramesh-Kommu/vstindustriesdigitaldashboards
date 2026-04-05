import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const units = ["Unit 1", "Unit 2", "Unit 3", "PMD", "SMD"];
const lines = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];
const machines = ["Compressor A", "Dryer B", "Motor C", "Furnace D", "Pump E", "Conveyor F"];

const parameters = [
  "Moisture Parameter 1",
  "Moisture Parameter 2",
  "Moisture Parameter 3",
  "Humidity Sensor 1",
  "Temperature 1",
  "Temperature 2",
  "Temperature 3",
];

const periods = ["Last 1 Hour", "Last 50 Data Points", "Last 7 Days", "Custom Date Range"];

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

const ProcessFilters = () => {
  const [period, setPeriod] = useState("Last 50 Data Points");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

      {/* Period Filter */}
      <div className="flex flex-col gap-1 min-w-[150px] flex-1 max-w-[200px]">
        <label className="text-xs font-medium text-muted-foreground">Period</label>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-9 text-sm bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar for Custom Date Range */}
      {period === "Custom Date Range" && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-9 justify-start text-left font-normal text-sm gap-2 min-w-[160px]")}>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                {format(selectedDate, "dd MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { if (date) { setSelectedDate(date); setCalendarOpen(false); } }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default ProcessFilters;
