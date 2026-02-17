import { useISSPasses } from '@/hooks/use-iss';
import { CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Calendar, ArrowUp, ArrowDown, TrendingUp, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ISSPassesProps {
  latitude: number | null;
  longitude: number | null;
  altitude?: number;
  days?: number;
}

export function ISSPasses({ latitude, longitude, altitude = 0, days = 10 }: ISSPassesProps) {
  const { data: passesData, isLoading, error } = useISSPasses(latitude, longitude, altitude, days);

  if (!latitude || !longitude) {
    return (
      <div className="bg-card border-0 rounded-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-white">Upcoming Passes</CardTitle>
        </div>
        <p className="text-sm text-slate-400">Enter your location to see upcoming ISS passes</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-card border-0 rounded-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-white">Upcoming Passes</CardTitle>
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border-0 rounded-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-white">Upcoming Passes</CardTitle>
        </div>
        <p className="text-red-400 text-sm">Failed to load pass predictions</p>
      </div>
    );
  }

  const passes = passesData?.passes || [];

  if (passes.length === 0) {
    return (
      <div className="bg-card border-0 rounded-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-white">Upcoming Passes</CardTitle>
        </div>
        <p className="text-sm text-slate-400">No passes found for the next {days} days</p>
      </div>
    );
  }

  return (
    <div className="bg-card border-0 rounded-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-400" />
        <CardTitle className="text-white">Upcoming Passes</CardTitle>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {passes.slice(0, 10).map((pass, index) => {
          const riseTime = parseISO(pass.riseTime);
          const setTime = parseISO(pass.setTime);

          return (
            <div key={index} className="p-3 bg-slate-800/50 rounded-sm border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-400">#{index + 1}</span>
                  <span className="text-sm text-white font-medium">
                    {format(riseTime, 'MMM d, HH:mm')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>{pass.maxElevation}°</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <ArrowUp className="w-3 h-3" />
                  <span>Rise: {format(riseTime, 'HH:mm')}</span>
                  <span className="ml-1 text-slate-500">({pass.riseAzimuth}°)</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <ArrowDown className="w-3 h-3" />
                  <span>Set: {format(setTime, 'HH:mm')}</span>
                  <span className="ml-1 text-slate-500">({pass.setAzimuth}°)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Duration: {pass.duration} minutes</span>
              </div>
            </div>
          );
        })}
      </div>

      {passes.length > 10 && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          Showing 10 of {passes.length} passes
        </p>
      )}
    </div>
  );
}

export default ISSPasses;

