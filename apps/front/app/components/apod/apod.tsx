import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { APODResponse } from "@/types/apod";
import ReactPlayer from "react-player";
import { Loader } from "@/components/ui/loader";
import type { JSX } from "react";
import { API_ROUTES } from "@/types/api-routes";

export function Apod(): JSX.Element {
  const { isPending, data, error } = useQuery<APODResponse>({
    queryKey: ["apod"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}${API_ROUTES.APOD}`).then((res) =>
        res.json()
      ),
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-[350px] w-full">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="flex justify-center items-center h-auto">
      <Card className="w-full">
        <CardTitle className="ml-6">Astronomy Picture of the Day</CardTitle>
        <CardContent className="mt-5">
          <div className="w-full h-[250px] rounded-xl overflow-hidden relative mt-3 bg-gray-200">
            {data.media_type === "image" && (
              <img alt={data.title} className="h-full w-full object-contain" src={data.url} />
            )}
            {data.media_type === "video" && (
              <ReactPlayer
                url={data.url}
                width={520}
                height={250}
                playing={true}
              />
            )}
          </div>
        </CardContent>
        <CardHeader className="pt-0">
          <CardTitle>{data.title}</CardTitle>
          <div className="flex gap-1 items-baseline">
            <p className="text-xs">Picture by : </p>
            <p className="font-bold text-xs">{data.copyright}</p>
          </div>
          <p className="text-xs text-gray-400">{data.date}</p>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3">{data.explanation}</p>
          <div className="mt-5 flex justify-between items-end">
            <p className="text-slate-500 text-xs">From NASA APOD</p>
            <a
              href={data.hdurl}
              target="_blank"
              className="text-slate-500 text-xs hover:cursor-pointer hover:underline"
              rel="noreferrer"
            >
              View in HD
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
