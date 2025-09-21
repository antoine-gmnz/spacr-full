import SpaceScene from '@/components/spaceExplorer/SpaceScene';
import { useSpaceExplorerPositions } from '@/hooks/use-space-explorer';

export default function SpaceExplorerPage() {
  const { data, isPending, error } = useSpaceExplorerPositions();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error || !data?.success) {
    return <div>Error: {error ? (error as any).message : 'Request failed'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Space Explorer (POC)</h1>
      <div className="text-sm text-gray-500 mb-4">Ephemeris time: {new Date(data.data.date).toLocaleString()}</div>
      <SpaceScene objects={data.data.positions} />
    </div>
  );
}
