import { useISSPosition, useISSCrew } from '@/hooks/use-iss';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { Satellite, Users, Gauge, MapPin } from 'lucide-react';

export function ISSInfo() {
  const { data: position, isLoading: positionLoading, error: positionError } = useISSPosition();
  const { data: crewData, isLoading: crewLoading, error: crewError } = useISSCrew();

  if (positionLoading) {
    return (
      <div className="bg-card border-0 rounded-sm p-4">
        <div className="flex items-center justify-center h-32">
          <Loader />
        </div>
      </div>
    );
  }

  if (positionError) {
    console.error('ISS Position Error:', positionError);
    return (
      <div className="bg-card border-0 rounded-sm p-4">
        <p className="text-red-400 text-sm">Failed to load ISS position</p>
        {positionError instanceof Error && (
          <p className="text-red-300 text-xs mt-1">{positionError.message}</p>
        )}
      </div>
    );
  }

  if (!position) {
    return null;
  }

  const crew = crewData?.crew || [];

  // Calculate orbital period (approximately 90 minutes for ISS)
  const orbitalPeriod = 90; // minutes

  return (
    <div className="bg-card border-0 rounded-sm p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Satellite className="w-5 h-5 text-blue-400" />
        <CardTitle className="text-white">ISS Live Tracking</CardTitle>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Position</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-500">Latitude:</span>
            <span className="ml-2 text-white font-medium">{position.latitude.toFixed(4)}°</span>
          </div>
          <div>
            <span className="text-slate-500">Longitude:</span>
            <span className="ml-2 text-white font-medium">{position.longitude.toFixed(4)}°</span>
          </div>
          <div>
            <span className="text-slate-500">Altitude:</span>
            <span className="ml-2 text-white font-medium">{position.altitude.toFixed(1)} km</span>
          </div>
          <div>
            <span className="text-slate-500">Velocity:</span>
            <span className="ml-2 text-white font-medium">{position.velocity.toFixed(2)} km/s</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 pt-2 border-t border-slate-700">
        <div className="flex items-center gap-2 text-sm">
          <Gauge className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Orbital Stats</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-500">Orbital Period:</span>
          <span className="ml-2 text-white font-medium">~{orbitalPeriod} minutes</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-500">Orbits per Day:</span>
          <span className="ml-2 text-white font-medium">~16</span>
        </div>
      </div>

      {/* Crew */}
      {crewError ? (
        <div className="pt-2 border-t border-slate-700">
          <p className="text-red-400 text-xs">Failed to load crew info</p>
        </div>
      ) : crewLoading ? (
        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-center h-16">
            <Loader size="sm" />
          </div>
        </div>
      ) : crew.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Current Crew ({crew.length})</span>
          </div>
          <div className="space-y-1">
            {crew.map((member, index) => (
              <div key={index} className="text-sm text-slate-300">
                • {member.name}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Timestamp */}
      <div className="pt-2 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Updated: {new Date(position.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default ISSInfo;

