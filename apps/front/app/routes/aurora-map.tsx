import { useState, useCallback } from 'react';
import { useAuroraData, useAuroraVisibility } from '@/hooks/use-aurora';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import BlurText from '@/components/ui/blurText';
import { MapPin, Navigation, Globe } from 'lucide-react';

// Lazy load the canvas component to avoid SSR issues
import { lazy, Suspense } from 'react';
const AuroraCanvas = lazy(() => import('@/components/auroraMap/AuroraCanvas'));
const KpIndex = lazy(() => import('@/components/auroraMap/KpIndex'));
const AuroraLegend = lazy(() => import('@/components/auroraMap/AuroraLegend'));

export function meta() {
  return [
    { title: 'Aurora Map - Real-time Northern Lights Forecast' },
    { name: 'description', content: 'Track aurora borealis and australis activity in real-time with our interactive aurora map.' },
  ];
}

export default function AuroraMapPage() {
  const { data: auroraData, isLoading, error } = useAuroraData();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);

  const { data: visibility, isLoading: visibilityLoading } = useAuroraVisibility(selectedLocation?.lat ?? null, selectedLocation?.lng ?? null);

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading aurora data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
          <p className="text-red-400">Failed to load aurora data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BlurText className="text-3xl font-bold dark:text-white text-slate-900 uppercase font-mono" text="Aurora Map" />
        </div>
        <p className="text-slate-400 max-w-2xl">
          Real-time aurora borealis and australis forecast. Click anywhere on the map to check aurora visibility for that location, or use your current location.
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Map */}
          <div className="bg-card border-0 rounded-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5" />
                  <CardTitle className="text-white">Aurora Forecast Map</CardTitle>
                </div>
                {auroraData && <span className="text-xs text-slate-500">Forecast: {new Date(auroraData.forecastTime).toLocaleString()}</span>}
              </div>
              <p className="text-slate-500 text-sm">Click on the map to check aurora visibility at any location</p>
            </div>
            <div>
              <Suspense fallback={<div className="w-full aspect-[2/1] bg-slate-800 animate-pulse" />}>
                <AuroraCanvas auroraData={auroraData?.coordinates || []} selectedLocation={selectedLocation} onLocationClick={handleMapClick} />
              </Suspense>
            </div>
          </div>

          {/* Location Visibility Card */}
          <div className="bg-card border-0 p-4">
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" />
                <CardTitle className="text-white">Location Visibility Check</CardTitle>
              </div>
              <CardDescription>Enter coordinates or use your current location</CardDescription>
            </div>
            <div>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-400 w-20">Latitude:</label>
                  <Input
                    type="number"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    placeholder="e.g., 64.5"
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
                    placeholder="e.g., -18.5"
                    className="w-32 bg-slate-800 border-slate-600 text-white"
                    step="0.01"
                    min="-180"
                    max="180"
                  />
                </div>
                <Button onClick={handleManualSearch} variant="secondary">
                  <MapPin className="w-4 h-4 mr-2" />
                  Check Location
                </Button>
                <Button onClick={handleGeolocation} variant="outline">
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Location
                </Button>
              </div>

              {geoError && <p className="text-red-400 text-sm mb-4">{geoError}</p>}

              {/* Visibility Result */}
              {selectedLocation && (
                <div className="mt-4 p-4 bg-card border-0 rounded-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">
                      {selectedLocation.lat.toFixed(2)}°, {selectedLocation.lng.toFixed(2)}°
                    </h4>
                    {visibilityLoading && <span className="text-slate-400 text-sm">Checking...</span>}
                  </div>

                  {visibility && !visibilityLoading && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${visibility.visible ? 'bg-green-500' : 'bg-slate-500'}`} />
                        <span className={visibility.visible ? 'text-green-400' : 'text-slate-400'}>
                          {visibility.visible ? 'Aurora may be visible!' : 'Low visibility expected'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Probability:</span>
                          <span className="ml-2 text-white font-medium">{visibility.probability}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Nearby Max:</span>
                          <span className="ml-2 text-white font-medium">{visibility.nearbyMaxProbability}%</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 mt-2">{visibility.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Kp Index */}
          {auroraData && (
            <Suspense fallback={<div className="h-48 bg-card border-0 rounded-sm animate-pulse" />}>
              <KpIndex kpIndex={auroraData.kpIndex} timestamp={auroraData.kpTimestamp} />
            </Suspense>
          )}

          {/* Legend */}
          <Suspense fallback={<div className="h-32 bg-card border-0 rounded-sm animate-pulse" />}>
            <AuroraLegend />
          </Suspense>

          {/* Tips */}
          <div className="bg-card border-0 rounded-sm p-4">
            <div className="pb-4">
              <h3 className="text-sm text-white font-bold">Viewing Tips</h3>
            </div>
            <div className="text-xs text-slate-400 space-y-2">
              <p>• Find a location away from city lights</p>
              <p>• Clear skies are essential for viewing</p>
              <p>• Best viewing times: 10 PM - 2 AM local</p>
              <p>• Allow 20-30 min for eyes to adjust to darkness</p>
              <p>• Higher Kp = aurora visible at lower latitudes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
