import { TableSchedule } from "@/components/schedule/submodules/tableSchedule";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { API_ROUTES } from "@/types/api-routes";
import { type LaunchDataResponse } from "@/types/launch-data";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export function Schedule() {
  const navigate = useNavigate();
  const { data, isPending, error } = useQuery<LaunchDataResponse>({
    queryKey: ["launches"],
    queryFn: () => {
      return fetch(
        `${import.meta.env.VITE_API_URL}${API_ROUTES.LAUNCHES}`
      ).then((response) => response.json());
    },
  });

  return (
    <Card title="Launch Schedule" className="p-5">
      <CardTitle className="flex justify-between">
        <p>Launch schedule</p>
        <Button
          variant="outline"
          size="sm"
          className="font-normal text-sm hover:cursor-pointer"
          onClick={() => navigate("/launch-schedule")}
        >
          View all
        </Button>
      </CardTitle>
      {isPending && (
        <div className="w-full flex items-center justify-center min-h-[350px]">
          <Loader />
        </div>
      )}
      {data && <TableSchedule data={data.results.slice(0, 7)} />}
    </Card>
  );
}
