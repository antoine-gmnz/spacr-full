import { useState, type JSX } from 'react';

import { useQuery } from '@tanstack/react-query';
import { ImageGallery } from '@/components/marsImages/imageGallery';
import { PaginationWrapper } from '@/components/paginationWrapper';
import { MarsParameters } from '@/components/marsImages/marsParameters';
import type { PaginatedResponse } from '@/types/pagination';
import type { MarsRoverResponse } from '@/types/rover';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/ui/loader';

export default function MarsImages(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [parameters, setParameters] = useState<{
    rover: string;
    camera: string;
    begin_sol: string;
    end_sol: string;
  }>({
    rover: '',
    camera: '',
    begin_sol: '',
    end_sol: '',
  });

  const { data, isLoading } = useQuery({
    enabled: !!parameters.rover && !!parameters.begin_sol && !!parameters.end_sol,
    queryKey: ['fetchImages', parameters, currentPage],
    queryFn: async () => {
      const { rover, camera, begin_sol, end_sol } = parameters;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/rover?rover=${rover}&camera=${camera}&begin_sol=${begin_sol}&end_sol=${end_sol}&limit=${limit}&page=${currentPage}`,
          {
            method: 'GET',
          }
        );
        const data = (await res.json()) as PaginatedResponse<MarsRoverResponse>;
        if (!hasFetched) {
          setHasFetched(true);
        }
        return data;
      } catch (e) {
        console.error(e);
      }
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-mono mb-6 uppercase">Mars rover images gallery</h1>
      <p className="text-slate-500 mb-5">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio vitae vero quisquam officia deserunt! Perferendis, neque necessitatibus nam laboriosam obcaecati vel in
        doloremque ratione iusto odio, dolore consequatur dolores alias.
      </p>
      <Separator className="w-100 my-10" />
      <MarsParameters setParameters={setParameters} isLoading={isLoading} />
      {!data?.data && (
        <div className="my-10">
          <Separator />
          <div className="flex items-center justify-center h-100 flex-col">
            {!hasFetched ? (
              <p className="text-gray-500">Please select parameters to fetch Mars rover images.</p>
            ) : (
              <p className="text-gray-500">No images found for the selected parameters.</p>
            )}
          </div>
        </div>
      )}
      {data?.data && <ImageGallery images={data.data.photos} />}
      {!data && isLoading && (
        <div className="w-full h-[200px] flex justify-center items-center">
          <Loader />
        </div>
      )}
      {data?.data && (
        <PaginationWrapper
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          onPageChange={(page: number) => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentPage(page);
          }}
        />
      )}
    </div>
  );
}
