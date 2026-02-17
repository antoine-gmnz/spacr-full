import { useState, useCallback } from 'react';
import { useISSPosition } from '@/hooks/use-iss';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import BlurText from '@/components/ui/blurText';
import { MapPin, Navigation, Globe, Satellite } from 'lucide-react';
import { EarthView } from '@/components/earthView';
import { ISSInfo } from '@/components/earthView/issInfo';
import { ISSPasses } from '@/components/earthView/issPasses';
import { Suspense } from 'react';

// ISS component is imported directly (not lazy) since it's lightweight

export function meta() {
  return [
    { title: 'Earth View - Live ISS Tracking' },
    { name: 'description', content: 'Track the International Space Station in real-time with 3D visualization, crew information, and pass predictions.' },
  ];
}

export default function EarthViewPage() {
  const { data: issPosition } = useISSPosition();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showISSTrail, setShowISSTrail] = useState(false);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 });
    setManualLat(lat.toFixed(2));
    setManualLng(lng.toFixed(2));
    setGeoError(null);
  }, []);

  const handleManualSearch = useCallback(() => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setGeoError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      setGeoError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setGeoError('Longitude must be between -180 and 180');
      return;
    }

    setSelectedLocation({ lat, lng });
    setGeoError(null);
  }, [manualLat, manualLng]);

  const handleGeolocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = Math.round(position.coords.latitude * 100) / 100;
        const lng = Math.round(position.coords.longitude * 100) / 100;
        setSelectedLocation({ lat, lng });
        setManualLat(lat.toFixed(2));
        setManualLng(lng.toFixed(2));
        setGeoError(null);
      },
      err => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location information unavailable');
            break;
          case err.TIMEOUT:
            setGeoError('Location request timed out');
            break;
          default:
            setGeoError('An error occurred getting your location');
        }
      }
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BlurText className="text-3xl font-bold dark:text-white text-slate-900 uppercase font-mono" text="Earth View" />
          <Satellite className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-slate-400 max-w-2xl">
          Real-time tracking of the International Space Station with 3D visualization, crew information, and pass predictions for your location.
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main 3D View Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* 3D Earth with ISS */}
          <div className="bg-card border-0 rounded-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5" />
                  <CardTitle className="text-white">Live ISS Tracking</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant={showISSTrail ? 'default' : 'outline'} size="sm" onClick={() => setShowISSTrail(!showISSTrail)}>
                    {showISSTrail ? 'Hide' : 'Show'} Trail
                  </Button>
                </div>
              </div>
              <CardDescription>Real-time position updates every 5 seconds</CardDescription>
            </div>
            <div className="relative">
              <EarthView showAurora={true} showSatellites={false} showISS={true} issPosition={issPosition} showISSTrail={showISSTrail} />
            </div>
          </div>

          {/* Location Input for Pass Predictions */}
          <div className="bg-card border-0 p-4">
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" />
                <CardTitle className="text-white">Pass Predictions</CardTitle>
              </div>
              <CardDescription>Enter coordinates or use your current location to see upcoming ISS passes</CardDescription>
            </div>
            <div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-400 w-20">Latitude:</label>
                  <Input
                    type="number"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    placeholder="e.g., 40.7128"
                    className="w-32 bg-slate-800 border-slate-600 text-white"
                    step="0.01"
                    min="-90"
                    max="90"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-400 w-20">Longitude:</label>
                  <Input
                    type="number"
                    value={manualLng}
                    onChange={e => setManualLng(e.target.value)}
                    placeholder="e.g., -74.0060"
                    className="w-32 bg-slate-800 border-slate-600 text-white"
                    step="0.01"
                    min="-180"
                    max="180"
                  />
                </div>
                <Button onClick={handleManualSearch} variant="secondary">
                  <MapPin className="w-4 h-4 mr-2" />
                  Check Passes
                </Button>
                <Button onClick={handleGeolocation} variant="outline">
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Location
                </Button>
              </div>

              {geoError && <p className="text-red-400 text-sm mb-4">{geoError}</p>}

              {/* Pass Predictions */}
              {selectedLocation && (
                <Suspense fallback={<div className="h-32 bg-card border-0 rounded-sm animate-pulse" />}>
                  <ISSPasses latitude={selectedLocation.lat} longitude={selectedLocation.lng} altitude={0} days={10} />
                </Suspense>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* ISS Info */}
          <Suspense fallback={<div className="h-64 bg-card border-0 rounded-sm animate-pulse" />}>
            <ISSInfo />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
