import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { useAuroraData } from '@/hooks/use-aurora';
import { Link } from 'react-router';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

function getKpLevel(kp: number): { label: string; variant: BadgeVariant; description: string } {
  if (kp >= 5) {
    return {
      label: 'Storm',
      variant: 'destructive',
      description: 'Major geomagnetic storm. Aurora visible at lower latitudes.',
    };
  }
  if (kp >= 3) {
    return {
      label: 'Unsettled',
      variant: 'outline',
      description: 'Moderate activity. High-latitude aurora likely.',
    };
  }
  return {
    label: 'Quiet',
    variant: 'secondary',
    description: 'Low geomagnetic activity. Aurora near polar regions only.',
  };
}

export function AuroraStatus() {
  const { data, isPending, error } = useAuroraData();

  if (isPending) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles size={16} />
            Aurora Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles size={16} />
            Aurora Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Unable to load aurora data.</p>
        </CardContent>
      </Card>
    );
  }

  const { label, variant, description } = getKpLevel(data.kpIndex);
  const isStorm = data.kpIndex >= 5;

  return (
    <Card className={cn('h-full flex flex-col', isStorm && 'border-destructive/50')}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Sparkles size={16} />
            Aurora Activity
          </span>
          <Badge variant={variant}>{label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-4">
          <span className={cn('text-5xl font-mono font-bold tabular-nums', isStorm && 'text-destructive')}>
            {data.kpIndex.toFixed(1)}
          </span>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Kp Index</p>
            <p className="text-sm mt-1 text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
          <Link to="/aurora-map">View aurora map →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
