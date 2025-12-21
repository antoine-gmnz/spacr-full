import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { 
  Calendar, 
  MapPin, 
  Rocket, 
  ChevronDown, 
  ExternalLink,
  Clock,
  Globe,
  Building2
} from 'lucide-react';
import type { LaunchData } from '@spacr/shared-types';

interface LaunchCardProps {
  launch: LaunchData;
  onViewDetails?: (launch: LaunchData) => void;
}

function getStatusColor(statusId: number): string {
  switch (statusId) {
    case 1: // Go for Launch
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 2: // TBD
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 3: // Success
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 4: // Failure
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 5: // Hold
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 6: // In Flight
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 7: // Partial Failure
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

function MiniCountdown({ targetDate }: { targetDate: Date }) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return (
      <span className="font-mono text-xs text-primary">
        T-{days}d {hours}h
      </span>
    );
  }
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return (
    <span className="font-mono text-xs text-emerald-400 animate-pulse">
      T-{hours}h {minutes}m
    </span>
  );
}

export function LaunchCard({ launch, onViewDetails }: LaunchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const launchTime = new Date(launch.net);
  const isUpcoming = launchTime > new Date();

  return (
    <div className="group bg-card rounded-sm overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <OptimizedImage
          src={launch.image?.image_url}
          alt={launch.name}
          objectFit="cover"
          fill
          className="group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(launch.status.id)}`}>
            {launch.status.name}
          </span>
        </div>

        {/* Countdown Badge */}
        {isUpcoming && launch.status.id === 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
            <MiniCountdown targetDate={launchTime} />
          </div>
        )}

        {/* Provider Abbreviation */}
        <div className="absolute bottom-3 right-3 bg-white/10 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-white text-xs font-bold">
            {launch.launch_service_provider.abbrev}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {launch.name}
        </h3>

        {/* Meta Info */}
        <div className="space-y-2 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono">
              {launchTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {' '}
              <span className="text-muted-foreground/60">
                {launchTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{launch.rocket.configuration.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{launch.pad.location.name}</span>
          </div>
        </div>

        {/* Mission Description */}
        {launch.mission?.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {launch.mission.description}
          </p>
        )}

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs h-8"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-in slide-in-from-top-2">
            {/* Mission Details */}
            {launch.mission && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  Mission
                </h4>
                <p className="text-xs text-muted-foreground">
                  {launch.mission.description || 'No description available'}
                </p>
                {launch.mission.orbit && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {launch.mission.orbit.name}
                  </Badge>
                )}
              </div>
            )}

            {/* Pad Info */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Launch Site
              </h4>
              <p className="text-xs text-muted-foreground">{launch.pad.name}</p>
              <p className="text-xs text-muted-foreground/70">{launch.pad.location.name}</p>
            </div>

            {/* Provider Info */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                Provider
              </h4>
              <p className="text-xs text-muted-foreground">{launch.launch_service_provider.name}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {launch.launch_service_provider.type?.name || 'Space Agency'}
              </Badge>
            </div>

            {/* Launch Stats */}
            {launch.probability > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Launch Probability:</span>
                <Badge 
                  variant={launch.probability >= 80 ? 'success' : 'secondary'}
                  className="text-xs"
                >
                  {launch.probability}%
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {launch.pad.wiki_url && (
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild>
                  <a href={launch.pad.wiki_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Wiki
                  </a>
                </Button>
              )}
              {onViewDetails && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={() => onViewDetails(launch)}
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

