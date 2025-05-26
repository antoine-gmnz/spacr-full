// This is a placeholder that will be fully implemented when we migrate the JWST components
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Parameters } from '@/components/jwst/parameters';
import { Loader } from '@/components/ui/loader';
import { JWSTGallery } from '@/components/jwst/gallery';
import { PaginationWrapper } from '@/components/paginationWrapper';
import { useQuery } from '@tanstack/react-query';
import { API_ROUTES } from '@/types/api-routes';

export default function JwstPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['jwst', { currentPage, limit, search }],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${API_ROUTES.JWST}?page=${currentPage}&limit=${limit}&search=${search}`);
      return response.json();
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">James Webb Space Telescope Gallery</h1>
      <p className="text-slate-500 mb-5">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio vitae vero quisquam officia deserunt! Perferendis, neque necessitatibus nam laboriosam obcaecati vel in
        doloremque ratione iusto odio, dolore consequatur dolores alias.
      </p>
      <Separator className="w-100 my-10" />
      <Parameters setSearch={setSearch} data={data} currentPage={currentPage} setLimit={setLimit} limit={limit} />
      {isLoading && (
        <div className="w-full h-[200px] flex justify-center items-center">
          <Loader />
        </div>
      )}
      {data && <JWSTGallery data={data} />}
      {data && <PaginationWrapper currentPage={data.currentPage} totalPages={data.totalPages} onPageChange={(page: number) => setCurrentPage(page)} />}
    </div>
  );
}
