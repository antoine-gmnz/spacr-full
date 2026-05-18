import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { useISSPosition, useISSCrew } from '@/hooks/use-iss';
import { Link } from 'react-router';
import { SatelliteIcon } from 'lucide-react';

export function IssStatus() {
  const { data: position, isPending: positionPending, error: positionError } = useISSPosition();
  const { data: crew, isPending: crewPending } = useISSCrew();

  if (positionPending || crewPending) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <SatelliteIcon size={16} />
            ISS — Live Position
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  if (positionError || !position) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <SatelliteIcon size={16} />
            ISS — Live Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Unable to load ISS data.</p>
        </CardContent>
      </Card>
    );
  }

  const latDir = position.latitude >= 0 ? 'N' : 'S';
  const lonDir = position.longitude >= 0 ? 'E' : 'W';
  const crewCount = crew?.crew?.length ?? '–';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <SatelliteIcon size={16} />
            ISS — Live Position
          </span>
          <Badge variant="success" className="font-mono text-xs">
            ● LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Coordinates</p>
            <p className="font-mono text-sm font-semibold">
              {Math.abs(position.latitude).toFixed(2)}° {latDir}, {Math.abs(position.longitude).toFixed(2)}° {lonDir}
            </p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Altitude</p>
            <p className="font-mono text-sm font-semibold">{position.altitude.toFixed(0)} km</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Crew aboard</p>
            <p className="font-mono text-sm font-semibold">{crewCount} astronauts</p>
          </div>
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Velocity</p>
            <p className="font-mono text-sm font-semibold">{position.velocity.toFixed(2)} km/s</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
          <Link to="/earth-view">Track live →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
