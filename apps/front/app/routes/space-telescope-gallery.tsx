import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Parameters } from '@/components/spaceTelescopeGallery/parameters';
import { Loader } from '@/components/ui/loader';
import { SpaceTelescopeGallery } from '@/components/spaceTelescopeGallery/gallery';
import { PaginationWrapper } from '@/components/paginationWrapper';
import { Header } from '@/components/spaceTelescopeGallery/header';
import toast from 'react-hot-toast';
import { useSpaceGallery } from '@/hooks/use-space-gallery';

export default function JwstPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<'HUBBLE' | 'JAMES_WEBB' | null>(null);

  const { data, isLoading, error } = useSpaceGallery({ page: currentPage, limit, search, telescope: type });

  useEffect(() => {
    if (error) {
      toast('Failed to fetch space telescope gallery', {
        duration: 3000,
        position: 'top-right',
      });
    }
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <Separator className="w-100 my-10" />
      <Parameters setSearch={setSearch} data={data} currentPage={currentPage} setLimit={setLimit} limit={limit} setType={setType} />
      {isLoading && (
        <div className="w-full h-[200px] flex justify-center items-center">
          <Loader />
        </div>
      )}
      {data && (
        <>
          <SpaceTelescopeGallery data={data} />
          <PaginationWrapper
            currentPage={data.meta.currentPage}
            totalPages={data.meta.lastPage}
            onPageChange={(page: number) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentPage(page);
            }}
          />
        </>
      )}
      {error && <div>{error.message}</div>}
    </div>
  );
}
