import { API_ROUTES } from "@/types/api-routes";
import { useQuery } from "@tanstack/react-query";
import SpaceScene, { type ObjectPositionDTO } from "@/components/spaceExplorer/SpaceScene";

export default function SpaceExplorerPage() {
    const {data, isPending, error} = useQuery<{ success: boolean, data: { date: string, positions: ObjectPositionDTO[] } }>({
        queryKey: ['space-explorer'],
        queryFn: () => fetch(`${import.meta.env.VITE_API_URL}${API_ROUTES.SPACE_EXPLORER}`).then(res => res.json())
    })

    if (isPending) {
        return <div>Loading...</div>
    }

    if (error || !data?.success) {
        return <div>Error: {error ? (error as any).message : 'Request failed'}</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Space Explorer (POC)</h1>
            <div className="text-sm text-gray-500 mb-4">Ephemeris time: {new Date(data.data.date).toLocaleString()}</div>
            <SpaceScene objects={data.data.positions} />
        </div>
    );
}