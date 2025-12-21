import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { useUpcomingLaunches } from '@/hooks/use-launches';
import { Countdown } from '@/components/countdown';
import type { LaunchData } from '@spacr/shared-types';
import { OptimizedImage } from '../ui/optimized-image';

export function UpcomingLaunch() {
  const { data, isPending, error } = useUpcomingLaunches(1);

  if (isPending) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Next Launch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.results.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Next Launch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">{error ? 'Failed to load launch data' : 'No upcoming launches found'}</div>
        </CardContent>
      </Card>
    );
  }

  const nextLaunch: LaunchData = data.results[0];
  const launchTime = new Date(nextLaunch.net);

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-card rounded-sm">
          <div className="w-1/2 relative h-[270px] rounded-sm overflow-hidden">
            <OptimizedImage src={nextLaunch.image.image_url} alt={nextLaunch.name} lazy={false} objectFit="cover" fill />
          </div>
          <div className="space-y-2 p-2 flex flex-col justify-between">
            <span className="flex flex-col gap-2 mb-8">
              <h3 className="text-xl font-semibold">{nextLaunch.name}</h3>
              <p className="text-sm text-muted-foreground">{nextLaunch.mission.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{nextLaunch.launch_service_provider.abbrev}</Badge>
                <Badge variant={nextLaunch.status.abbrev === 'Success' ? 'success' : 'secondary'}>{nextLaunch.status.name}</Badge>
              </div>
            </span>
            <div className="text-xs text-muted-foreground">
              <p className="text-sm text-muted-foreground mb-2">
                {launchTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </p>
              <p>
                <strong>Mission:</strong> {nextLaunch.mission.name}
              </p>
              <p>
                <strong>Pad:</strong> {nextLaunch.pad.name}, {nextLaunch.pad.location.name}
              </p>
              <p>
                <strong>Rocket:</strong> {nextLaunch.rocket.configuration.name}
              </p>
            </div>
          </div>
        </div>
        {nextLaunch.status.id === 1 && <Countdown targetDate={launchTime} />}
      </div>
    </div>
  );
}
