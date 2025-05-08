import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format, endOfDay, startOfDay, subDays, subMonths, subYears } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DateRangePickerProps = {
  className?: string;
  onChange: (range: DateRange | undefined) => void;
  value: DateRange | undefined;
  align?: "start" | "center" | "end";
  showPresets?: boolean;
};

export function DateRangePicker({
  className,
  value,
  onChange,
  align = "center",
  showPresets = true,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const presets = [
    {
      id: "today",
      name: "Today",
      dates: {
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "yesterday",
      name: "Yesterday",
      dates: {
        from: startOfDay(subDays(new Date(), 1)),
        to: endOfDay(subDays(new Date(), 1)),
      },
    },
    {
      id: "last7",
      name: "Last 7 days",
      dates: {
        from: startOfDay(subDays(new Date(), 6)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "last30",
      name: "Last 30 days",
      dates: {
        from: startOfDay(subDays(new Date(), 29)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "thisMonth",
      name: "This month",
      dates: {
        from: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "lastMonth",
      name: "Last month",
      dates: {
        from: startOfDay(subMonths(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 1)),
        to: endOfDay(subDays(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 1)),
      },
    },
    {
      id: "last3Months",
      name: "Last 3 months",
      dates: {
        from: startOfDay(subMonths(new Date(), 3)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "last6Months",
      name: "Last 6 months",
      dates: {
        from: startOfDay(subMonths(new Date(), 6)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "thisYear",
      name: "This year",
      dates: {
        from: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
        to: endOfDay(new Date()),
      },
    },
    {
      id: "lastYear",
      name: "Last year",
      dates: {
        from: startOfDay(new Date(new Date().getFullYear() - 1, 0, 1)),
        to: endOfDay(new Date(new Date().getFullYear() - 1, 11, 31)),
      },
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
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex flex-col sm:flex-row">
            <div className="border-r p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={value?.from}
                selected={value}
                onSelect={onChange}
                numberOfMonths={2}
              />
            </div>
            {showPresets && (
              <div className="grid auto-rows-max gap-0.5 overflow-y-auto p-2">
                <div className="grid gap-1 px-2 py-1">
                  <div className="text-sm font-medium">Date presets</div>
                </div>
                <div className="grid gap-1">
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => {
                        onChange(preset.dates);
                        setIsOpen(false);
                      }}
                    >
                      <span>{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}