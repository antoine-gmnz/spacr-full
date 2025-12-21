import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Countdown } from '@/components/countdown';
import { 
  Calendar, 
  MapPin, 
  Rocket, 
  Globe, 
  Building2, 
  ExternalLink,
  Target,
  Clock,
  Info,
  Video,
  Map
} from 'lucide-react';
import type { LaunchData } from '@spacr/shared-types';

interface LaunchDetailModalProps {
  launch: LaunchData | null;
  isOpen: boolean;
  onClose: () => void;
}

function getStatusColor(statusId: number): string {
  switch (statusId) {
    case 1: return 'bg-emerald-500';
    case 2: return 'bg-amber-500';
    case 3: return 'bg-green-500';
    case 4: return 'bg-red-500';
    case 5: return 'bg-orange-500';
    case 6: return 'bg-blue-500';
    default: return 'bg-slate-500';
  }
}

export function LaunchDetailModal({ launch, isOpen, onClose }: LaunchDetailModalProps) {
  if (!launch) return null;

  const launchTime = new Date(launch.net);
  const isUpcoming = launchTime > new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Hero Image */}
        <div className="relative h-64 w-full">
          <OptimizedImage
            src={launch.image?.image_url}
            alt={launch.name}
            objectFit="cover"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(launch.status.id)}`} />
            <Badge variant="secondary">{launch.status.name}</Badge>
          </div>
        </div>

        <div className="px-6 pb-6 -mt-16 relative">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold">{launch.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {launch.mission?.type || 'Space Mission'}
            </DialogDescription>
          </DialogHeader>

          {/* Countdown for upcoming launches */}
          {isUpcoming && launch.status.id === 1 && (
            <div className="mt-4">
              <Countdown targetDate={launchTime} title="Launch Countdown" />
            </div>
          )}

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Launch Details */}
            <div className="space-y-6">
              {/* Date & Time */}
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  Launch Date & Time
                </h4>
                <div className="bg-card rounded-sm p-4 border border-border/50">
                  <p className="font-mono text-lg">
                    {launchTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-muted-foreground font-mono">
                    {launchTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short',
                    })}
                  </p>
                  {launch.net_precision && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {launch.net_precision.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rocket */}
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Rocket className="w-4 h-4 text-primary" />
                  Rocket
                </h4>
                <div className="bg-card rounded-sm p-4 border border-border/50">
                  <p className="font-medium">{launch.rocket.configuration.full_name}</p>
                  {launch.rocket.configuration.families?.[0] && (
                    <p className="text-sm text-muted-foreground">
                      Family: {launch.rocket.configuration.families[0].name}
                    </p>
                  )}
                </div>
              </div>

              {/* Provider */}
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-primary" />
                  Launch Provider
                </h4>
                <div className="bg-card rounded-sm p-4 border border-border/50">
                  <p className="font-medium">{launch.launch_service_provider.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {launch.launch_service_provider.type?.name || 'Space Agency'}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {launch.launch_service_provider.abbrev}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Column - Mission & Pad */}
            <div className="space-y-6">
              {/* Mission */}
              {launch.mission && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    Mission
                  </h4>
                  <div className="bg-card rounded-sm p-4 border border-border/50">
                    <p className="font-medium mb-2">{launch.mission.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {launch.mission.description || 'Mission details not available.'}
                    </p>
                    {launch.mission.orbit && (
                      <div className="flex items-center gap-2 mt-3">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm">{launch.mission.orbit.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {launch.mission.orbit.abbrev}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Launch Pad */}
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  Launch Site
                </h4>
                <div className="bg-card rounded-sm p-4 border border-border/50">
                  <p className="font-medium">{launch.pad.name}</p>
                  <p className="text-sm text-muted-foreground">{launch.pad.location.name}</p>
                  {launch.pad.map_image && (
                    <div className="relative h-24 w-full mt-3 rounded overflow-hidden">
                      <OptimizedImage
                        src={launch.pad.map_image}
                        alt={launch.pad.name}
                        objectFit="cover"
                        fill
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {launch.pad.wiki_url && (
                      <Button variant="outline" size="sm" asChild className="text-xs">
                        <a href={launch.pad.wiki_url} target="_blank" rel="noopener noreferrer">
                          <Info className="w-3 h-3 mr-1" />
                          Wiki
                        </a>
                      </Button>
                    )}
                    {launch.pad.map_url && (
                      <Button variant="outline" size="sm" asChild className="text-xs">
                        <a href={launch.pad.map_url} target="_blank" rel="noopener noreferrer">
                          <Map className="w-3 h-3 mr-1" />
                          Map
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  Statistics
                </h4>
                <div className="bg-card rounded-sm p-4 border border-border/50 grid grid-cols-2 gap-4">
                  {launch.probability > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Launch Probability</p>
                      <p className="text-lg font-mono font-bold text-primary">{launch.probability}%</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Pad Launches</p>
                    <p className="text-lg font-mono font-bold">{launch.pad_launch_attempt_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Agency Launches (Year)</p>
                    <p className="text-lg font-mono font-bold">{launch.agency_launch_attempt_count_year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orbital Attempts</p>
                    <p className="text-lg font-mono font-bold">{launch.orbital_launch_attempt_count}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather & Additional Info */}
          {launch.weather_concerns && (
            <>
              <Separator className="my-6" />
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-primary" />
                  Weather Concerns
                </h4>
                <p className="text-sm text-muted-foreground bg-card rounded-sm p-4 border border-border/50">
                  {launch.weather_concerns}
                </p>
              </div>
            </>
          )}

          {/* External Links */}
          {(launch.mission?.vid_urls?.length > 0 || launch.mission?.info_urls?.length > 0) && (
            <>
              <Separator className="my-6" />
              <div className="flex flex-wrap gap-2">
                {launch.mission?.vid_urls?.map((url: string, i: number) => (
                  <Button key={i} variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <Video className="w-3 h-3 mr-1" />
                      Watch
                    </a>
                  </Button>
                ))}
                {launch.mission?.info_urls?.map((url: string, i: number) => (
                  <Button key={i} variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      More Info
                    </a>
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

