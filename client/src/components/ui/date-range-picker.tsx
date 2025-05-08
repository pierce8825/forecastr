import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  align?: "start" | "center" | "end";
  showCompare?: boolean;
}

export function DateRangePicker({
  className,
  dateRange,
  onDateRangeChange,
  align = "center",
  showCompare = false,
}: DateRangePickerProps) {
  // Default date range is last 30 days
  React.useEffect(() => {
    if (!dateRange) {
      const today = new Date();
      onDateRangeChange({
        from: addDays(today, -30),
        to: today,
      });
    }
  }, [dateRange, onDateRangeChange]);

  // Preset ranges
  const handleRangeSelection = (days: number) => {
    const today = new Date();
    onDateRangeChange({
      from: addDays(today, -days),
      to: today,
    });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
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
          <div className="flex flex-col gap-2 p-3">
            {/* Quick selection options */}
            <div className="flex gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={() => handleRangeSelection(7)}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={() => handleRangeSelection(30)}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={() => handleRangeSelection(90)}
              >
                Last 90 days
              </Button>
            </div>
            
            {/* Calendar selection */}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}