import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Parameters } from '@/components/spaceTelescopeGallery/parameters';
import { Loader } from '@/components/ui/loader';
import { SpaceTelescopeGallery } from '@/components/spaceTelescopeGallery/gallery';
import { PaginationWrapper } from '@/components/paginationWrapper';
import { useQuery } from '@tanstack/react-query';
import { API_ROUTES } from '@/types/api-routes';
import { Header } from '@/components/spaceTelescopeGallery/header';
import toast from 'react-hot-toast';
import type { SpaceTelescopeImage } from '@/types/jwst';
import type { PaginatedResponse } from '@spacr/shared-types/dto';

export default function JwstPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<'HUBBLE' | 'JAMES_WEBB' | null>(null);

  const { data, isLoading, error } = useQuery<PaginatedResponse<SpaceTelescopeImage>>({
    queryKey: ['space-telescope-gallery', { currentPage, limit, search, type }],
    queryFn: async (): Promise<PaginatedResponse<SpaceTelescopeImage>> => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${API_ROUTES.SPACE_GALLERY}?page=${currentPage}&limit=${limit}&search=${search}&telescope=${type || ''}`);
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      return (await res.json()) as PaginatedResponse<SpaceTelescopeImage>;
    },
  });

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
      {data && <SpaceTelescopeGallery data={data} />}
      {data && (
        <PaginationWrapper
          currentPage={data.meta.currentPage}
          totalPages={data.meta.lastPage}
          onPageChange={(page: number) => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentPage(page);
          }}
        />
      )}
      {error && <div>{error.message}</div>}
    </div>
  );
}
