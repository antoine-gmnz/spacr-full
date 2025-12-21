import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';
import BlurText from '@/components/ui/blurText';
import { useInfiniteLaunches } from '@/hooks/use-launches';
import { 
  LaunchHero, 
  LaunchFilters, 
  LaunchGrid,
  LaunchDetailModal 
} from '@/components/launchSchedule';
import type { LaunchData } from '@spacr/shared-types';
import { Rocket } from 'lucide-react';

export function meta() {
  return [
    { title: 'Launch Schedule - Upcoming Space Missions' },
    { name: 'description', content: 'Track upcoming rocket launches, space missions, and orbital events from SpaceX, NASA, ESA, and more.' },
  ];
}

export default function LaunchSchedulePage() {
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchData | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteLaunches({ 
    search, 
    year,
    limit: 12 
  });

  // Flatten all pages into a single array
  const allLaunches = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.results);
  }, [data]);

  // Get total count from first page
  const totalCount = data?.pages?.[0]?.count ?? 0;

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
        rootMargin: '400px',
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleViewDetails = useCallback((launch: LaunchData) => {
    setSelectedLaunch(launch);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLaunch(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8">
        <LaunchHero />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-6 h-6 text-primary" />
            <BlurText 
              className="text-3xl font-bold dark:text-white text-slate-900 uppercase font-mono" 
              text="Launch Schedule" 
            />
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Explore upcoming and past rocket launches from space agencies and private companies around the world.
            Filter by mission, year, or search for specific launches.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Filters */}
        <div className="mb-8">
          <LaunchFilters
            onSearchChange={setSearch}
            onYearChange={setYear}
            totalCount={totalCount}
            loadedCount={allLaunches.length}
          />
        </div>

        {/* Error State */}
        {error && allLaunches.length === 0 && (
          <div className="bg-amber-900/20 border border-amber-800/50 rounded-sm p-6 text-center mb-8">
            <p className="text-amber-400">
              Unable to load launches at this time. The service may be temporarily unavailable.
            </p>
            <p className="text-amber-400/70 text-sm mt-2">
              Please try again in a few minutes.
            </p>
          </div>
        )}

        {/* Launch Grid */}
        <LaunchGrid
          launches={allLaunches}
          isLoading={isLoading}
          isFetchingMore={isFetchingNextPage}
          hasMore={hasNextPage}
          onLoadMore={() => void fetchNextPage()}
          onViewDetails={handleViewDetails}
          emptyMessage={
            search || year
              ? 'No launches match your filters. Try adjusting your search criteria.'
              : 'No launches available at this time.'
          }
        />

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-4" />
      </div>

      {/* Detail Modal */}
      <LaunchDetailModal
        launch={selectedLaunch}
        isOpen={!!selectedLaunch}
        onClose={handleCloseModal}
      />
    </div>
  );
}
