import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  FastForward,
  Rewind
} from 'lucide-react';

interface TimeControlsProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [
  { label: '1 hour/s', value: 3600 },
  { label: '1 day/s', value: 86400 },
  { label: '1 week/s', value: 604800 },
  { label: '1 month/s', value: 2592000 },
  { label: '1 year/s', value: 31536000 },
];

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function TimeControls({
  currentDate,
  onDateChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange,
}: TimeControlsProps) {
  const [localDate, setLocalDate] = useState(formatDateTimeLocal(currentDate));

  // Sync local date when external date changes
  useEffect(() => {
    if (!isPlaying) {
      setLocalDate(formatDateTimeLocal(currentDate));
    }
  }, [currentDate, isPlaying]);

  // Update local date during playback
  useEffect(() => {
    if (isPlaying) {
      setLocalDate(formatDateTimeLocal(currentDate));
    }
  }, [currentDate, isPlaying]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalDate(value);
    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  const handleReset = () => {
    onDateChange(new Date());
  };

  const handleStep = (direction: 'forward' | 'backward') => {
    const newDate = new Date(currentDate);
    const delta = direction === 'forward' ? playbackSpeed * 1000 : -playbackSpeed * 1000;
    newDate.setTime(newDate.getTime() + delta);
    onDateChange(newDate);
  };

  const isNow = Math.abs(currentDate.getTime() - Date.now()) < 60000;

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-sm p-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Date/Time Display */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-sm flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Current Time</p>
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                value={localDate}
                onChange={handleDateChange}
                className="bg-slate-800/50 border-slate-700 text-white w-[210px] text-sm"
              />
              {isNow && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  NOW
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-12 bg-slate-700/50" />

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleStep('backward')}
            disabled={isPlaying}
            className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Rewind className="w-4 h-4" />
          </Button>
          
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="icon"
            onClick={onPlayPause}
            className={isPlaying 
              ? "bg-indigo-600 hover:bg-indigo-700" 
              : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
            }
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleStep('forward')}
            disabled={isPlaying}
            className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <FastForward className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 ml-2"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Now
          </Button>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-12 bg-slate-700/50" />

        {/* Speed Control */}
        <div className="flex-1 min-w-[200px] max-w-[350px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              Playback Speed
            </span>
            <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
              {SPEED_OPTIONS.find(o => o.value === playbackSpeed)?.label || `${playbackSpeed}s/s`}
            </Badge>
          </div>
          <div className="flex gap-1">
            {SPEED_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={playbackSpeed === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => onSpeedChange(option.value)}
                className={`text-xs flex-1 px-2 ${
                  playbackSpeed === option.value 
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {option.label.split('/')[0]}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

