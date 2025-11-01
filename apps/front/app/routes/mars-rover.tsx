import { Fragment, useState, type JSX } from 'react';

import { ImageGallery } from '@/components/marsImages/imageGallery';
import { PaginationWrapper } from '@/components/paginationWrapper';
import { MarsParameters } from '@/components/marsImages/marsParameters';
import { useLatestRoverImages, useSearchRoverImages } from '@/hooks/use-rover';
import { Separator } from '@/components/ui/separator';
import { Loader } from '@/components/ui/loader';

export default function MarsImages(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [parameters, setParameters] = useState<{
    rover: number;
    camera: number;
    begin_sol: string;
    end_sol: string;
  }>({
    rover: 0,
    camera: 0,
    begin_sol: '',
    end_sol: '',
  });

  const { data: latestImages, isLoading: isLoadingLatestImages } = useLatestRoverImages();

  const { data, isLoading } = useSearchRoverImages({
    rover: parameters.rover,
    camera: parameters.camera,
    beginSol: parameters.begin_sol,
    endSol: parameters.end_sol,
    page: currentPage,
    limit,
  });
  if (!hasFetched && data) setHasFetched(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-mono mb-6 uppercase">Mars rover images gallery</h1>
      <p className="text-slate-500 mb-5">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio vitae vero quisquam officia deserunt! Perferendis, neque necessitatibus nam laboriosam obcaecati vel in
        doloremque ratione iusto odio, dolore consequatur dolores alias.
      </p>
      <Separator className="w-100 my-10" />
      <MarsParameters setParameters={setParameters} isLoading={isLoading} />
      {!data?.data && !latestImages?.data && (
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
      {data?.data && (
        <Fragment>
          <ImageGallery response={data} />
          <PaginationWrapper
            currentPage={data.meta.currentPage}
            totalPages={data.meta.lastPage}
            onPageChange={(page: number) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentPage(page);
            }}
          />
        </Fragment>
      )}
      {!data?.data && latestImages?.data && <ImageGallery response={latestImages} />}
      {data?.data.length === 0 && (
        <div className="flex items-center justify-center h-100 flex-col">
          <p className="text-gray-500">No images found for the selected parameters.</p>
        </div>
      )}
      {!data && (isLoading || isLoadingLatestImages) && (
        <div className="w-full h-[200px] flex justify-center items-center">
          <Loader />
        </div>
      )}
    </div>
  );
}
