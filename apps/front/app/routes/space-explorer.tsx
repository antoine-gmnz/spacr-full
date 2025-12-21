import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import BlurText from '@/components/ui/blurText';
import { useSpaceExplorerPositions } from '@/hooks/use-space-explorer';
import { 
  SpaceHero, 
  SpaceScene, 
  PlanetInfo, 
  PlanetLegend,
  TimeControls,
  type PlanetPosition,
  type BodyName,
} from '@/components/spaceExplorer';
import { 
  Orbit, 
  Tag, 
  RotateCw,
  Settings,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';

export function meta() {
  return [
    { title: 'Space Explorer - 3D Solar System' },
    { name: 'description', content: 'Explore our solar system in real-time 3D. View current planetary positions, track celestial events, and navigate through time.' },
  ];
}

// All celestial bodies
const ALL_BODIES: BodyName[] = ['Sun', 'Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

export default function SpaceExplorerPage() {
  // Time state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(86400); // 1 day per second
  
  // Selection state
  const [selectedPlanet, setSelectedPlanet] = useState<BodyName | null>(null);
  const [visiblePlanets, setVisiblePlanets] = useState<Set<BodyName>>(new Set(ALL_BODIES));
  
  // Display options
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Refs
  const sceneRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<number | null>(null);
  
  // Fetch data - only refetch when date changes and not playing
  const { data, isPending, error, refetch } = useSpaceExplorerPositions(
    currentDate,
    true,
    isPlaying ? 0 : 0 // Disable auto-refetch during playback
  );
  
  // Playback effect
  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = window.setInterval(() => {
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setTime(newDate.getTime() + playbackSpeed * 100); // 100ms tick
          return newDate;
        });
      }, 100);
    } else if (playbackRef.current) {
      clearInterval(playbackRef.current);
      playbackRef.current = null;
    }
    
    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);
  
  // Debounced refetch during playback
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        refetch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentDate, isPlaying, refetch]);
  
  // Handlers
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
    if (!isPlaying) {
      refetch();
    }
  }, [isPlaying, refetch]);
  
  const handlePlanetSelect = useCallback((planet: PlanetPosition | null) => {
    setSelectedPlanet(planet?.body || null);
  }, []);
  
  const handleToggleVisibility = useCallback((body: BodyName) => {
    setVisiblePlanets(prev => {
      const next = new Set(prev);
      if (next.has(body)) {
        next.delete(body);
      } else {
        next.add(body);
      }
      return next;
    });
  }, []);
  
  const handleFocusPlanet = useCallback((body: BodyName) => {
    setSelectedPlanet(body);
    // The scene will automatically focus on the selected planet
  }, []);
  
  const scrollToScene = useCallback(() => {
    sceneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  
  // Get selected planet data
  const selectedPlanetData = useMemo(() => {
    if (!selectedPlanet || !data?.data?.positions) return null;
    return data.data.positions.find(p => p.body === selectedPlanet) || null;
  }, [selectedPlanet, data?.data?.positions]);
  
  // Loading state
  if (isPending && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 mx-auto" />
          <p className="text-muted-foreground">Loading solar system data...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-amber-900/20 border border-amber-800/50 rounded-sm p-8 text-center max-w-md mx-auto">
            <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
            <p className="text-amber-400/80 mb-4">
              Unable to load planetary data. The service may be temporarily unavailable.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const positions = data?.data?.positions || [];
  const nextEvent = data?.data?.nextEvent;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <BlurText
              text="Space Explorer"
              className="text-4xl font-bold"
              animateBy="letters"
              delay={50}
              direction="top"
            />
            <p className="text-muted-foreground mt-2">
              Interactive 3D solar system with real-time ephemeris data
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="border-slate-700 text-slate-400 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Display Options
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Display Options (collapsible) */}
        {showSettings && (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-sm p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={showOrbits ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOrbits(!showOrbits)}
                className={showOrbits 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "border-slate-700 text-slate-400 hover:text-white"
                }
              >
                <Orbit className="w-4 h-4 mr-2" />
                Orbits
              </Button>
              
              <Button
                variant={showLabels ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLabels(!showLabels)}
                className={showLabels 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "border-slate-700 text-slate-400 hover:text-white"
                }
              >
                <Tag className="w-4 h-4 mr-2" />
                Labels
              </Button>
              
              <Button
                variant={autoRotate ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRotate(!autoRotate)}
                className={autoRotate 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "border-slate-700 text-slate-400 hover:text-white"
                }
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Auto Rotate
              </Button>
            </div>
          </div>
        )}
        
        <Separator className="bg-border/50" />
        
        {/* Hero Section */}
        <SpaceHero 
          nextEvent={nextEvent}
          positions={positions}
          onExploreClick={scrollToScene}
        />
        
        <Separator className="bg-border/50" />
        
        {/* Time Controls */}
        <TimeControls
          currentDate={currentDate}
          onDateChange={handleDateChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
        />
        
        {/* Main Content - Scene + Info Panel */}
        <div ref={sceneRef} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* 3D Scene */}
          <div className="lg:col-span-3">
            <div className="h-[600px] lg:h-[700px]">
              <SpaceScene
                positions={positions}
                selectedPlanet={selectedPlanet}
                visiblePlanets={visiblePlanets}
                showOrbits={showOrbits}
                showLabels={showLabels}
                autoRotate={autoRotate}
                onPlanetSelect={handlePlanetSelect}
              />
            </div>
          </div>
          
          {/* Side Panel - Legend or Planet Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Planet Info (when selected) */}
            {selectedPlanetData && (
              <PlanetInfo
                planet={selectedPlanetData}
                onClose={() => setSelectedPlanet(null)}
              />
            )}
            
            {/* Legend (always visible) */}
            <PlanetLegend
              positions={positions}
              selectedPlanet={selectedPlanet}
              visiblePlanets={visiblePlanets}
              onPlanetSelect={handleFocusPlanet}
              onToggleVisibility={handleToggleVisibility}
              onFocusPlanet={handleFocusPlanet}
            />
          </div>
        </div>
        
        {/* Footer info */}
        <div className="text-center text-sm text-slate-500 py-4">
          <p>
            Ephemeris data calculated using precision astronomy algorithms. 
            Positions accurate to within arcminutes.
          </p>
          <p className="mt-1">
            Data time: {currentDate.toLocaleString()} {isPlaying && '(simulating)'}
          </p>
        </div>
      </div>
    </div>
  );
}
