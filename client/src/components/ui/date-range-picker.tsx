import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subMonths, isValid, isAfter, isBefore, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

export type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  placeholder?: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
};

export const DateRangePicker = ({
  value,
  onChange,
  placeholder = 'Select date range',
  align = 'start',
  className,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle quick selections
  const handleQuickSelection = (months: number) => {
    const today = new Date();
    const from = subMonths(today, months);
    onChange?.({ from, to: today });
    setIsOpen(false);
  };

  const buttonText = () => {
    if (!value?.from) return placeholder;
    if (!value.to) return format(value.from, 'PPP');
    return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
  };

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground",
              "h-10 px-3 py-2"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{buttonText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto"
          align={align}
          sideOffset={5}
        >
          <div className="flex flex-col space-y-4 p-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelection(1)}
              >
                Last Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelection(3)}
              >
                Last 3 Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelection(6)}
              >
                Last 6 Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelection(12)}
              >
                Last Year
              </Button>
            </div>
            <div className="border-t pt-4">
              <Calendar
                mode="range"
                defaultMonth={value?.from}
                selected={value}
                onSelect={onChange}
                numberOfMonths={2}
                disabled={(date) => {
                  // Disable future dates
                  return isAfter(date, new Date());
                }}
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};