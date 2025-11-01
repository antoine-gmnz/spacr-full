import { useQuery } from '@tanstack/react-query';
import type { APODResponse } from '@/types/apod';
import { Loader } from '@/components/ui/loader';
import type { JSX } from 'react';
import { API_ROUTES } from '@/types/api-routes';
import { CardV2 } from '../ui/cardv2';

export function Apod(): JSX.Element {
  const { isPending, data, error } = useQuery<APODResponse>({
    queryKey: ['apod'],
    queryFn: () => fetch(`${import.meta.env.VITE_API_URL}${API_ROUTES.APOD}`).then(res => res.json()),
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
    <div className="flex justify-center items-center h-full w-full">
      <CardV2 title={data.title} description={data.explanation} image={data.url} link={data.hdurl} video={data.url} copyright={data.copyright} />
    </div>
  );
}
