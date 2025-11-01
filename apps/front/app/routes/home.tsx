import { Apod } from '@/components/apod/apod';
import { Separator } from '@/components/ui/separator';
import image from '@/assets/mars.png';
import imageWebb from '@/assets/webb.jpg';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BlurText from '@/components/ui/blurText';
import { Link } from 'react-router';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-auto">
        <BlurText className="text-3xl font-bold dark:text-white text-slate-900 uppercase font-mono" text="Welcome to Spacr !" />
        <p className="text-slate-500 mb-5">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio vitae vero quisquam officia deserunt! Perferendis, neque necessitatibus nam laboriosam obcaecati vel
          in doloremque ratione iusto odio, dolore consequatur dolores alias.
        </p>
      </div>
      <Separator />
      <div className="w-full h-full flex gap-2 mt-5">
        <div className="w-4/12 h-[550px]">
          <Apod />
        </div>
        <div className="w-8/12">
          <div className="h-[550px] w-full bg-card rounded-sm flex relative">
            <img src={image} alt="image" className="w-auto h-full object-cover rounded-sm" />
            <div className="h-32 w-2/3 top-10 left-10 rounded-r-sm absolute">
              <BlurText className="text-white text-2xl font-bold" text="Discover stunning images of Mars" />
              <p className="text-white text-sm text-left">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              <Button variant="outline" className="mt-4 self-end w-1/3">
                <Link to="/mars-rover">View all images</Link>
              </Button>
            </div>
            <div className="absolute bottom-10 right-10">
              <Badge className="font-mono dark:text-white text-black bg-card">ESA/Roscosmos/CaSSIS</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[550px] mt-2 relative">
        <div className="w-full h-full card relative rounded-t-sm">
          <img src={imageWebb} alt="image" className="w-auto h-full object-cover rounded-sm" />
        </div>
        <div className="rounded-b-sm absolute bottom-10 left-10 w-2/3">
          <BlurText className="text-white text-lg font-bold" text="Hubble and James Webb Space Telescope Images" />
          <p className="text-white text-sm text-left">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Lorem ipsum dolor sit
            amet consectetur adipisicing elit. Quisquam, quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          </p>
          <Button variant="outline" className="mt-4 self-end w-1/3">
            <Link to="/space-telescope-gallery">View all images</Link>
          </Button>
        </div>
        <div className="absolute bottom-10 right-10">
          <Badge className="font-mono dark:text-white text-black bg-card">NASA, ESA, CSA, STScI</Badge>
        </div>
      </div>
    </div>
  );
}
