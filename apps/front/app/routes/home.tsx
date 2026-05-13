import { useQuery } from '@tanstack/react-query';
import { Apod } from '@/components/apod/apod';
import { UpcomingLaunch } from '@/components/upcoming-launch';
import { IssStatus } from '@/components/issStatus';
import { AuroraStatus } from '@/components/auroraStatus';
import { Separator } from '@/components/ui/separator';
import marsImage from '@/assets/mars.png';
import webbFallback from '@/assets/webb.jpg';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BlurText from '@/components/ui/blurText';
import { Link } from 'react-router';
import { spaceGalleryApi } from '@/api/space-gallery';

export default function Home() {
  const { data: telescopeData } = useQuery({
    queryKey: ['home-telescope-peek'],
    queryFn: () => spaceGalleryApi.getImages({ limit: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  const latestTelescopeImage = telescopeData?.data?.[0];
  const telescopeImgSrc = latestTelescopeImage?.imgSrc ?? webbFallback;
  const telescopeImgTitle = latestTelescopeImage?.title ?? 'Hubble and James Webb Space Telescope Images';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="h-auto mb-5">
        <BlurText className="text-3xl font-bold dark:text-white text-slate-900 uppercase font-mono" text="What's happening in space, right now." />
        <p className="text-slate-500 mt-2">
          Real-time ISS tracking, upcoming launches, aurora forecasts, planetary positions, and stunning imagery from Mars to the edge of the universe — all in one place.
        </p>
      </div>

      <Separator />

      {/* Next Launch */}
      <div className="mt-8 mb-8">
        <UpcomingLaunch />
      </div>

      <Separator />

      {/* Live Data */}
      <div className="w-full flex gap-2 mt-5">
        <div className="w-5/12 h-[550px]">
          <Apod />
        </div>
        <div className="w-7/12 h-[550px] flex flex-col gap-2">
          <div className="flex-1 min-h-0">
            <IssStatus />
          </div>
          <div className="flex-1 min-h-0">
            <AuroraStatus />
          </div>
        </div>
      </div>

      <Separator className="mt-5" />

      {/* Explore */}
      <div className="flex gap-2 mt-5">
        {/* Mars Rover promo */}
        <div className="w-1/2 h-[420px] bg-card rounded-sm relative overflow-hidden">
          <img src={marsImage} alt="Mars surface captured by NASA rover" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="absolute top-10 left-10 right-16">
            <BlurText className="text-white text-2xl font-bold" text="Explore Mars through rover eyes" />
            <p className="text-white/80 text-sm mt-2 max-w-xs">
              Browse thousands of raw and processed images captured by Curiosity and Perseverance — filterable by camera, date, and Martian sol.
            </p>
            <Button variant="outline" className="mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/mars-rover">View Mars images</Link>
            </Button>
          </div>
          <div className="absolute bottom-4 right-4">
            <Badge className="font-mono dark:text-white text-black bg-card">NASA / JPL-Caltech</Badge>
          </div>
        </div>

        {/* Telescope Gallery promo */}
        <div className="w-1/2 h-[420px] bg-card rounded-sm relative overflow-hidden">
          <img src={telescopeImgSrc} alt={telescopeImgTitle} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="absolute top-10 left-10 right-16">
            <BlurText className="text-white text-2xl font-bold" text="Hubble & James Webb Telescope" />
            <p className="text-white/80 text-sm mt-2 max-w-xs">
              The universe in unprecedented detail. Browse the full ESA, Hubble, and JWST image archive — from stellar nurseries to colliding galaxies.
            </p>
            <Button variant="outline" className="mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/space-telescope-gallery">Browse gallery</Link>
            </Button>
          </div>
          <div className="absolute bottom-4 right-4">
            <Badge className="font-mono dark:text-white text-black bg-card">NASA, ESA, CSA, STScI</Badge>
          </div>
        </div>
      </div>

      {/* 3D Space Explorer banner */}
      <div className="mt-2 h-[180px] bg-card rounded-sm border flex items-center px-10">
        <div>
          <BlurText className="text-2xl font-bold font-mono uppercase dark:text-white text-slate-900" text="3D Solar System Explorer" />
          <p className="text-muted-foreground text-sm mt-1 max-w-lg">
            Navigate a real-time 3D model of the solar system powered by live ephemeris data. Explore planetary positions, orbital paths, and celestial mechanics.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/space-explorer">Launch explorer →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
