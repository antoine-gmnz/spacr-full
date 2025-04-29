// This is a placeholder that will be fully implemented when we migrate the Earth View components
import { useTleData } from '../hooks/use-tle';

export function meta() {
  return [
    { title: "Earth View - Satellite Tracking" },
    { name: "description", content: "Track satellites in real-time around Earth" },
  ];
}

export default function EarthViewPage() {
  const { data, isLoading, error } = useTleData();
  
  const satellites = data?.member || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Earth Satellite Viewer</h1>
      <p className="mb-6">This page will display an interactive 3D view of Earth with real-time satellite positions.</p>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">
            {error instanceof Error ? error.message : 'Failed to fetch satellite data. Please try again later.'}
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Satellites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {satellites.map((satellite) => (
              <div key={satellite.satelliteId} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold">{satellite.name}</h3>
                <p className="text-sm text-gray-600">ID: {satellite.satelliteId}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-500">TLE Data</summary>
                  <pre className="mt-2 text-xs overflow-x-auto bg-gray-100 p-2 rounded">
                    {satellite.line1}
                    <br/>
                    {satellite.line2}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}