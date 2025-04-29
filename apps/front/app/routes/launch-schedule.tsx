import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/types/api-routes";
import type { LaunchData } from "@/types/launch-data";
import { TableSchedule } from "@/components/schedule/submodules/tableSchedule";
import { Separator } from "@/components/ui/separator";

export default function LaunchSchedulePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["launches"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}${API_ROUTES.LAUNCHES}`).then(
        (res) => res.json()
      ),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Launches</h1>
      <p className="text-gray-600 mb-8">
        Stay updated with the latest launch schedules and mission details.
      </p>
      <Separator />

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">
            {error instanceof Error
              ? error.message
              : "Failed to fetch launch schedule. Please try again later."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {data && <TableSchedule data={data.results} />}
        </div>
      )}
    </div>
  );
}
