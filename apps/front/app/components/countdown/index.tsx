import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CountdownProps {
  targetDate: Date;
  title?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ targetDate, title = 'Next Launch' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground rounded-lg p-3 min-w-[60px] text-center">
        <div className="text-2xl font-mono font-bold">{value.toString().padStart(2, '0')}</div>
      </div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isExpired ? (
          <div className="text-center py-8">
            <Badge variant="secondary" className="text-sm">
              Launch completed
            </Badge>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            <TimeUnit value={timeLeft.days} label="Days" />
            <div className="flex items-center text-muted-foreground">:</div>
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <div className="flex items-center text-muted-foreground">:</div>
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <div className="flex items-center text-muted-foreground">:</div>
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
