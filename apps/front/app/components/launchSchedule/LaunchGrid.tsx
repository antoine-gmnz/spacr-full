import { LaunchCard } from './LaunchCard';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Rocket, RefreshCw } from 'lucide-react';
import type { LaunchData } from '@spacr/shared-types';

interface LaunchGridProps {
  launches: LaunchData[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onViewDetails?: (launch: LaunchData) => void;
  emptyMessage?: string;
}

function LaunchCardSkeleton() {
  return (
    <div className="bg-card rounded-sm overflow-hidden border border-border/50 animate-pulse">
      <div className="h-48 bg-slate-700/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-700/50 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-700/30 rounded w-1/2" />
          <div className="h-3 bg-slate-700/30 rounded w-2/3" />
          <div className="h-3 bg-slate-700/30 rounded w-1/2" />
        </div>
        <div className="h-3 bg-slate-700/20 rounded w-full" />
        <div className="h-3 bg-slate-700/20 rounded w-4/5" />
        <div className="h-8 bg-slate-700/30 rounded mt-4" />
      </div>
    </div>
  );
}

export function LaunchGrid({ 
  launches, 
  isLoading, 
  isFetchingMore, 
  hasMore, 
  onLoadMore,
  onViewDetails,
  emptyMessage = 'No launches found'
}: LaunchGridProps) {
  // Show skeleton grid while initially loading
  if (isLoading && launches.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LaunchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && launches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
          <Rocket className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Launches Found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {launches.map((launch) => (
          <LaunchCard 
            key={launch.id} 
            launch={launch} 
            onViewDetails={onViewDetails}
          />
        ))}
        
        {/* Skeleton cards while fetching more */}
        {isFetchingMore && 
          Array.from({ length: 3 }).map((_, i) => (
            <LaunchCardSkeleton key={`skeleton-${i}`} />
          ))
        }
      </div>

      {/* Load More Button */}
      {hasMore && !isFetchingMore && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onLoadMore}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Load More Launches
          </Button>
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {isFetchingMore && (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      )}

      {/* End of results */}
      {!hasMore && launches.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            You've seen all {launches.length} launches
          </p>
        </div>
      )}
    </div>
  );
}

