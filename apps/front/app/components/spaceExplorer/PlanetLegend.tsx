import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Focus } from 'lucide-react';
import type { PlanetPosition, BodyName } from './types';
import { PLANET_COLORS } from './types';

interface PlanetLegendProps {
  positions: PlanetPosition[];
  selectedPlanet: BodyName | null;
  visiblePlanets: Set<BodyName>;
  onPlanetSelect: (body: BodyName) => void;
  onToggleVisibility: (body: BodyName) => void;
  onFocusPlanet: (body: BodyName) => void;
}

// Order planets by distance from Sun
const PLANET_ORDER: BodyName[] = ['Sun', 'Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

export function PlanetLegend({
  positions,
  selectedPlanet,
  visiblePlanets,
  onPlanetSelect,
  onToggleVisibility,
  onFocusPlanet,
}: PlanetLegendProps) {
  // Sort positions by planet order
  const sortedPositions = [...positions].sort(
    (a, b) => PLANET_ORDER.indexOf(a.body) - PLANET_ORDER.indexOf(b.body)
  );

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-sm overflow-hidden">
      <div className="p-3 border-b border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-300">Solar System Bodies</h3>
        <p className="text-xs text-slate-500 mt-1">Click to select, double-click to focus</p>
      </div>
      
      <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
        {sortedPositions.map((planet) => {
          const color = PLANET_COLORS[planet.body];
          const isSelected = selectedPlanet === planet.body;
          const isVisible = visiblePlanets.has(planet.body);
          
          return (
            <div
              key={planet.body}
              className={`
                group flex items-center gap-2 p-2 rounded-sm cursor-pointer transition-all
                ${isSelected 
                  ? 'bg-slate-700/70 ring-1 ring-indigo-500/50' 
                  : 'hover:bg-slate-800/50'
                }
                ${!isVisible ? 'opacity-50' : ''}
              `}
              onClick={() => onPlanetSelect(planet.body)}
              onDoubleClick={() => onFocusPlanet(planet.body)}
            >
              {/* Planet Indicator */}
              <div 
                className="w-5 h-5 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ 
                  backgroundColor: color,
                  boxShadow: isSelected ? `0 0 12px ${color}` : `0 0 6px ${color}50`
                }}
              />
              
              {/* Planet Name & Distance */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {planet.body}
                </p>
                <p className="text-xs text-slate-500">
                  {planet.distanceAu.toFixed(2)} AU
                </p>
              </div>
              
              {/* Magnitude (if applicable) */}
              {planet.magnitude !== undefined && (
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xs text-slate-400">
                    m: {planet.magnitude.toFixed(1)}
                  </p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-slate-500 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(planet.body);
                  }}
                >
                  {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-slate-500 hover:text-indigo-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocusPlanet(planet.body);
                  }}
                >
                  <Focus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="p-2 border-t border-slate-700/50 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs text-slate-400 hover:text-white"
          onClick={() => {
            // Toggle all visibility
            const allVisible = positions.every(p => visiblePlanets.has(p.body));
            positions.forEach(p => {
              if (allVisible !== visiblePlanets.has(p.body)) {
                onToggleVisibility(p.body);
              }
            });
          }}
        >
          Toggle All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs text-slate-400 hover:text-white"
          onClick={() => onFocusPlanet('Sun')}
        >
          Reset View
        </Button>
      </div>
    </div>
  );
}

