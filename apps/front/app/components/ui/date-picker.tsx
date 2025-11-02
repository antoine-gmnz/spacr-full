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
}

function DatePicker({ onValueChange }: DatePickerProps): JSX.Element {
  const [date, setDate] = React.useState<Date>();

  useEffect(() => {
    if (date) onValueChange(date);
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" data-empty={!date} className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal">
          <CalendarIcon />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" startMonth={new Date(1900, 0)} endMonth={new Date(new Date().getFullYear() + 10, 11)} />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
