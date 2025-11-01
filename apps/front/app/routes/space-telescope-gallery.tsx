import { useEffect, useRef, useState, useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { Parameters } from '@/components/spaceTelescopeGallery/parameters';
import { Loader } from '@/components/ui/loader';
import { SpaceTelescopeGallery } from '@/components/spaceTelescopeGallery/gallery';
import { Header } from '@/components/spaceTelescopeGallery/header';
import toast from 'react-hot-toast';
import { useSpaceGallery } from '@/hooks/use-space-gallery';

export default function JwstPage() {
  const [limit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<'HUBBLE' | 'JAMES_WEBB' | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useSpaceGallery({
    limit,
    search,
    telescope: type,
  });

  // Flatten all pages into a single array
  const allImages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: '400px', // Start loading when 400px before reaching the bottom
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (error) {
      toast('Failed to fetch space telescope gallery', {
        duration: 3000,
        position: 'top-right',
      });
    }
  }, [error]);

  // Get current page info for Parameters component
  const currentPageInfo = data?.pages?.[0]?.meta;

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <Separator className="w-100 my-10" />
      <Parameters
        setSearch={setSearch}
        data={data?.pages?.[0]}
        currentPage={currentPageInfo?.currentPage || 1}
        setLimit={() => {}}
        limit={limit}
        setType={setType}
        totalLoaded={allImages.length}
      />
      {isLoading && !data && (
        <div className="w-full h-[200px] flex justify-center items-center">
          <Loader />
        </div>
      )}
      {allImages.length > 0 && <SpaceTelescopeGallery images={allImages} />}
      {error && <div className="text-center text-red-500 mt-4">{error.message}</div>}
      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="w-full h-20 flex justify-center items-center">
        {isFetchingNextPage && <Loader />}
      </div>
      {!hasNextPage && allImages.length > 0 && (
        <div className="text-center text-muted-foreground py-8">
          <p>You've reached the end!</p>
        </div>
      )}
    </div>
  );
}
