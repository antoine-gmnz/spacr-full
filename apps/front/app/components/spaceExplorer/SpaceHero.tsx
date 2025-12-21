import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Telescope, Orbit, Star, ChevronDown } from 'lucide-react';
import type { PlanetPosition } from './types';

interface SpaceHeroProps {
  nextEvent?: {
    title: string;
    description: string;
    body: string;
  };
  positions?: PlanetPosition[];
  onExploreClick?: () => void;
}

// Planet colors for visual indicators
const PLANET_COLORS: Record<string, string> = {
  Sun: '#ffaa00',
  Moon: '#dddddd',
  Mercury: '#b3b3b3',
  Venus: '#d9c58b',
  Earth: '#3fa7ff',
  Mars: '#d14b3f',
  Jupiter: '#c89f6c',
  Saturn: '#d3c7a6',
  Uranus: '#7fd1d8',
  Neptune: '#5a79d6',
};

function PlanetDot({ body, distance }: { body: string; distance: number }) {
  const color = PLANET_COLORS[body] || '#ffffff';
  return (
    <div className="flex items-center gap-2 text-xs">
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
      />
      <span className="text-white/80">{body}</span>
      <span className="text-white/50">{distance.toFixed(2)} AU</span>
    </div>
  );
}

export function SpaceHero({ nextEvent, positions, onExploreClick }: SpaceHeroProps) {
  // Get visible planets (not Sun, Moon, or Earth)
  const visiblePlanets = positions?.filter(
    p => !['Sun', 'Moon', 'Earth'].includes(p.body) && p.magnitude !== undefined
  ).sort((a, b) => (a.magnitude ?? 99) - (b.magnitude ?? 99)).slice(0, 5) || [];

  return (
    <div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/50">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        {/* Star particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Event Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                  <Telescope className="w-3 h-3 mr-1" />
                  Live Solar System
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  <Orbit className="w-3 h-3 mr-1" />
                  Real-time Data
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Space Explorer
              </h1>
              
              <p className="text-lg text-slate-400 max-w-lg">
                Explore our solar system in real-time. View current planetary positions, 
                track celestial events, and navigate through time.
              </p>
            </div>

            {/* Next Event Card */}
            {nextEvent && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-sm p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: PLANET_COLORS[nextEvent.body] || '#5a79d6',
                      boxShadow: `0 0 20px ${PLANET_COLORS[nextEvent.body] || '#5a79d6'}40`
                    }}
                  >
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{nextEvent.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{nextEvent.description}</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={onExploreClick}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Orbit className="w-4 h-4 mr-2" />
              Explore 3D View
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Right: Planet Summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Brightest Planets Tonight
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {visiblePlanets.length > 0 ? (
                visiblePlanets.map(planet => (
                  <div 
                    key={planet.body}
                    className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-sm p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ 
                          backgroundColor: PLANET_COLORS[planet.body],
                          boxShadow: `0 0 12px ${PLANET_COLORS[planet.body]}50`
                        }}
                      />
                      <div>
                        <span className="text-white font-medium">{planet.body}</span>
                        <p className="text-xs text-slate-500">
                          {planet.distanceAu.toFixed(2)} AU from Earth
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-slate-300">
                        Mag {planet.magnitude?.toFixed(1)}
                      </span>
                      <p className="text-xs text-slate-500">
                        {planet.elongationDeg.toFixed(0)}° from Sun
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Loading planetary data...
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {positions && positions.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/50">
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">{positions.length}</span>
                  <p className="text-xs text-slate-500">Bodies Tracked</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-indigo-400">
                    {visiblePlanets.filter(p => (p.magnitude ?? 99) < 0).length}
                  </span>
                  <p className="text-xs text-slate-500">Very Bright</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-emerald-400">
                    {positions.filter(p => p.elongationDeg > 30).length}
                  </span>
                  <p className="text-xs text-slate-500">Well Positioned</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

