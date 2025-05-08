import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  className?: string;
  align?: "center" | "start" | "end";
  showPresets?: boolean;
}

export function DateRangePicker({
  dateRange,
  setDateRange,
  className,
  align = "start",
  showPresets = true,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const presets = [
    {
      label: "Today",
      value: {
        from: new Date(),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Yesterday",
      value: {
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() - 1)),
      } as DateRange,
    },
    {
      label: "Last 7 days",
      value: {
        from: new Date(new Date().setDate(new Date().getDate() - 6)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Last 30 days",
      value: {
        from: new Date(new Date().setDate(new Date().getDate() - 29)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Last 90 days",
      value: {
        from: new Date(new Date().setDate(new Date().getDate() - 89)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Last month",
      value: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      } as DateRange,
    },
    {
      label: "Last quarter",
      value: {
        from: new Date(
          new Date().getFullYear(),
          Math.floor(new Date().getMonth() / 3) * 3 - 3,
          1
        ),
        to: new Date(
          new Date().getFullYear(),
          Math.floor(new Date().getMonth() / 3) * 3,
          0
        ),
      } as DateRange,
    },
    {
      label: "This year",
      value: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Last year",
      value: {
        from: new Date(new Date().getFullYear() - 1, 0, 1),
        to: new Date(new Date().getFullYear() - 1, 11, 31),
      } as DateRange,
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex flex-col sm:flex-row">
            {showPresets && (
              <div className="border-r p-2">
                <div className="px-1 py-2 text-sm font-medium">Presets</div>
                <div className="grid min-w-[150px] gap-1">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      className="justify-start text-left font-normal"
                      onClick={() => {
                        setDateRange(preset.value);
                        setIsOpen(false);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface DateRangePresetPickerProps {
  dateRange: DateRange | undefined; 
  onChange: (dateRange: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePresetPicker({
  dateRange,
  onChange,
  className,
}: DateRangePresetPickerProps) {
  const presets = [
    {
      label: "Today",
      value: "today",
      range: {
        from: new Date(),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Yesterday",
      value: "yesterday",
      range: {
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() - 1)),
      } as DateRange,
    },
    {
      label: "Last 7 days",
      value: "last7days",
      range: {
        from: new Date(new Date().setDate(new Date().getDate() - 6)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Last 30 days",
      value: "last30days",
      range: {
        from: new Date(new Date().setDate(new Date().getDate() - 29)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Last 90 days",
      value: "last90days",
      range: {
        from: new Date(new Date().setDate(new Date().getDate() - 89)),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Last month",
      value: "lastmonth",
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      } as DateRange,
    },
    {
      label: "This year",
      value: "thisyear",
      range: {
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      } as DateRange,
    },
    {
      label: "Last year",
      value: "lastyear",
      range: {
        from: new Date(new Date().getFullYear() - 1, 0, 1),
        to: new Date(new Date().getFullYear() - 1, 11, 31),
      } as DateRange,
    },
    {
      label: "Custom",
      value: "custom",
      range: dateRange,
    },
  ];

  // Find the corresponding preset for the current date range
  const selectedPreset = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "custom";
    
    const preset = presets.find((p) => {
      if (p.value === "custom") return false;
      const range = p.range;
      if (!range || !range.from || !range.to) return false;
      
      const fromDate = range.from as Date;
      const toDate = range.to as Date;
      
      return (
        format(fromDate, "yyyy-MM-dd") === format(dateRange.from, "yyyy-MM-dd") &&
        format(toDate, "yyyy-MM-dd") === format(dateRange.to, "yyyy-MM-dd")
      );
    });
    
    return preset?.value || "custom";
  }, [dateRange]);

  return (
    <div className={cn("flex items-center", className)}>
      <Select
        value={selectedPreset}
        onValueChange={(value) => {
          const preset = presets.find((p) => p.value === value);
          if (preset) {
            onChange(preset.range);
          }
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select a period" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedPreset === "custom" && (
        <DateRangePicker
          dateRange={dateRange}
          setDateRange={onChange}
          className="ml-2"
          showPresets={false}
        />
      )}
    </div>
  );
}