import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import React, { useEffect, type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

interface DatePickerProps {
  placeholder: string | React.ReactNode;
  onValueChange: (date: Date) => void;
  disabled: boolean;
  fromDate: string | undefined;
  toDate: string | undefined;
}

function DatePicker({ placeholder, onValueChange, disabled = false, fromDate, toDate }: DatePickerProps): JSX.Element {
  const [date, setDate] = React.useState<Date>();

  useEffect(() => {
    if (date) onValueChange(date);
  }, [date]);

  useEffect(() => {
    setDate(undefined);
  }, [fromDate, toDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={cn('w-[240px] justify-start text-left font-normal', !date && 'text-muted-foreground')} disabled={disabled} variant="outline">
          <CalendarIcon />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          className="border bg-white dark:bg-accent"
          defaultMonth={date || new Date()}
          fromDate={fromDate ? new Date(fromDate) : undefined}
          initialFocus
          mode="single"
          onSelect={setDate}
          selected={date}
          toDate={toDate ? new Date(toDate) : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
