import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Countdown } from '@/components/countdown';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useUpcomingLaunches } from '@/hooks/use-launches';
import { MapPin, Rocket, Calendar, ExternalLink, Radio } from 'lucide-react';
import type { LaunchData } from '@spacr/shared-types';

function getStatusVariant(statusId: number): 'default' | 'secondary' | 'success' | 'destructive' {
  switch (statusId) {
    case 1: // Go for Launch
      return 'success';
    case 2: // TBD
      return 'secondary';
    case 3: // Success
      return 'success';
    case 4: // Failure
      return 'destructive';
    default:
      return 'default';
  }
}

export function LaunchHero() {
  const { data, isPending, error } = useUpcomingLaunches(1);

  if (isPending) {
    return (
      <div className="relative w-full h-[500px] rounded-sm overflow-hidden bg-card animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="h-8 w-48 bg-slate-700 rounded mb-4" />
          <div className="h-12 w-96 bg-slate-700 rounded mb-4" />
          <div className="h-4 w-64 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data || data.results.length === 0) {
    return (
      <div className="relative w-full h-[300px] rounded-sm overflow-hidden bg-card flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No upcoming launches available</p>
        </div>
      </div>
    );
  }

  const nextLaunch: LaunchData = data.results[0];
  const launchTime = new Date(nextLaunch.net);
  const isUpcoming = launchTime > new Date();

  return (
    <div className="relative w-full rounded-sm overflow-hidden">
      {/* Background Image */}
      <div className="relative h-[520px]">
        <OptimizedImage
          src={nextLaunch.image.image_url}
          alt={nextLaunch.name}
          lazy={false}
          objectFit="cover"
          fill
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
        <div className="max-w-4xl">
          {/* Labels */}
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-primary/90 text-white border-0 uppercase tracking-wider text-xs font-mono">
              Next Launch
            </Badge>
            <Badge variant={getStatusVariant(nextLaunch.status.id)}>
              {nextLaunch.status.name}
            </Badge>
            {nextLaunch.webcast_live && (
              <Badge className="bg-red-600 text-white border-0 animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                Live
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {nextLaunch.name}
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm lg:text-base max-w-2xl mb-6 line-clamp-2">
            {nextLaunch.mission?.description || 'Mission details coming soon...'}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-mono">
                {launchTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span>{nextLaunch.rocket.configuration.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{nextLaunch.pad.location.name}</span>
            </div>
          </div>

          {/* Provider Logo + Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-sm px-4 py-2">
              {nextLaunch.launch_service_provider.abbrev && (
                <span className="text-white font-semibold">
                  {nextLaunch.launch_service_provider.name}
                </span>
              )}
            </div>

            {nextLaunch.pad.wiki_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={nextLaunch.pad.wiki_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Countdown - positioned to the right on larger screens */}
        {isUpcoming && nextLaunch.status.id === 1 && (
          <div className="absolute right-8 bottom-8 lg:right-12 lg:bottom-12 hidden md:block">
            <Countdown targetDate={launchTime} title="T-Minus" />
          </div>
        )}
      </div>

      {/* Mobile Countdown */}
      {isUpcoming && nextLaunch.status.id === 1 && (
        <div className="md:hidden mt-4">
          <Countdown targetDate={launchTime} title="T-Minus" />
        </div>
      )}
    </div>
  );
}

