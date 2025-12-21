import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Orbit, 
  Globe, 
  Sun, 
  Moon,
  Ruler,
  Eye,
  Clock,
  Target
} from 'lucide-react';
import type { PlanetPosition, BodyName } from './types';
import { PLANET_COLORS } from './types';

interface PlanetInfoProps {
  planet: PlanetPosition | null;
  onClose: () => void;
}

function formatDegrees(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = Math.round(((deg - d) * 60 - m) * 60);
  return `${d}° ${m}' ${s}"`;
}

function formatRA(ra: number): string {
  const hours = ra / 15;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.round(((hours - h) * 60 - m) * 60);
  return `${h}h ${m}m ${s}s`;
}

function getVisibilityRating(magnitude?: number, elongation?: number): { label: string; color: string } {
  if (magnitude === undefined) return { label: 'N/A', color: 'text-slate-500' };
  
  if (magnitude < -2 && elongation && elongation > 30) {
    return { label: 'Excellent', color: 'text-emerald-400' };
  } else if (magnitude < 1 && elongation && elongation > 20) {
    return { label: 'Good', color: 'text-green-400' };
  } else if (magnitude < 3) {
    return { label: 'Moderate', color: 'text-amber-400' };
  } else {
    return { label: 'Difficult', color: 'text-red-400' };
  }
}

export function PlanetInfo({ planet, onClose }: PlanetInfoProps) {
  if (!planet) return null;

  const visibility = getVisibilityRating(planet.magnitude, planet.elongationDeg);
  const color = PLANET_COLORS[planet.body as BodyName] || '#ffffff';

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="relative p-4 bg-gradient-to-r from-slate-800/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: color,
                boxShadow: `0 0 24px ${color}60`
              }}
            >
              {planet.body === 'Sun' && <Sun className="w-6 h-6 text-white" />}
              {planet.body === 'Moon' && <Moon className="w-6 h-6 text-slate-800" />}
              {!['Sun', 'Moon'].includes(planet.body) && <Globe className="w-6 h-6 text-white/80" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{planet.body}</h3>
              <p className="text-sm text-slate-400">{planet.orbitalPeriodDays} day orbit</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Separator className="bg-slate-700/50" />

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed">
          {planet.description}
        </p>

        {/* Visibility */}
        {planet.magnitude !== undefined && (
          <div className="bg-slate-800/50 rounded-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-400">Visibility</span>
              </div>
              <span className={`font-semibold ${visibility.color}`}>
                {visibility.label}
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Distance */}
          <div className="bg-slate-800/30 rounded-sm p-3">
            <div className="flex items-center gap-2 mb-1">
              <Ruler className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-500 uppercase">Distance</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {planet.distanceAu.toFixed(3)} AU
            </span>
            <p className="text-xs text-slate-500">
              ~{(planet.distanceAu * 149597870.7).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
            </p>
          </div>

          {/* Magnitude */}
          <div className="bg-slate-800/30 rounded-sm p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-500 uppercase">Magnitude</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {planet.magnitude !== undefined ? planet.magnitude.toFixed(1) : '—'}
            </span>
            <p className="text-xs text-slate-500">Apparent brightness</p>
          </div>

          {/* Elongation */}
          <div className="bg-slate-800/30 rounded-sm p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-500 uppercase">Elongation</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {planet.elongationDeg.toFixed(1)}°
            </span>
            <p className="text-xs text-slate-500">Angle from Sun</p>
          </div>

          {/* Phase */}
          <div className="bg-slate-800/30 rounded-sm p-3">
            <div className="flex items-center gap-2 mb-1">
              <Moon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 uppercase">Phase</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {(planet.phase * 100).toFixed(0)}%
            </span>
            <p className="text-xs text-slate-500">Illumination</p>
          </div>
        </div>

        <Separator className="bg-slate-700/30" />

        {/* Coordinates */}
        <div className="space-y-2">
          <h4 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Orbit className="w-4 h-4" />
            Equatorial Coordinates
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">RA:</span>
              <span className="text-white ml-2">{formatRA(planet.ra)}</span>
            </div>
            <div>
              <span className="text-slate-500">Dec:</span>
              <span className="text-white ml-2">{planet.dec >= 0 ? '+' : ''}{formatDegrees(Math.abs(planet.dec))}</span>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-700/30" />

        {/* 3D Position */}
        <div className="space-y-2">
          <h4 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Heliocentric Position (AU)
          </h4>
          
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-slate-800/30 rounded p-2 text-center">
              <span className="text-slate-500">X</span>
              <p className="text-white">{planet.x.toFixed(4)}</p>
            </div>
            <div className="bg-slate-800/30 rounded p-2 text-center">
              <span className="text-slate-500">Y</span>
              <p className="text-white">{planet.y.toFixed(4)}</p>
            </div>
            <div className="bg-slate-800/30 rounded p-2 text-center">
              <span className="text-slate-500">Z</span>
              <p className="text-white">{planet.z.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Angular Size */}
        <div className="bg-slate-800/30 rounded-sm p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-400">Angular Diameter</span>
          </div>
          <span className="text-white font-medium">
            {planet.angularDiameterArcsec.toFixed(1)}"
          </span>
        </div>
      </div>
    </div>
  );
}

