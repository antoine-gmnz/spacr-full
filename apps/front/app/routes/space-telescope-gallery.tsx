// This is a placeholder that will be fully implemented when we migrate the JWST components
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

export default function JwstPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<'HUBBLE' | 'JAMES_WEBB' | null>(null);

  // The error variable from useQuery is only set if the queryFn throws an error.
  // In your code, even if the API returns a 500, fetch does not throw; it resolves the promise.
  // You need to check response.ok and throw if not ok, so that useQuery can catch it and set error.
  const { data, isLoading, error } = useQuery({
    queryKey: ['space-telescope-gallery', { currentPage, limit, search, type }],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${API_ROUTES.SPACE_GALLERY}?page=${currentPage}&limit=${limit}&search=${search}&telescope=${type || ''}`);
      const data = await response.json();
      console.log(data);
      if (data.status !== 200 || !Array.isArray(data)) {
        // Optionally, you can parse the error body for more details
        const errorMessage = `Error ${data.message}`;
        toast.error(errorMessage, {
          duration: 3000,
          position: 'top-right',
        });
      }
      return data;
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
      {data && Array.isArray(data) && <SpaceTelescopeGallery data={data} />}
      {data && (
        <PaginationWrapper
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          onPageChange={(page: number) => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentPage(page);
          }}
        />
      )}
      {error}
    </div>
  );
}
