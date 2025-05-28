import { Apod } from '@/components/apod/apod';
import { Schedule } from '@/components/schedule';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-auto">
        <h1 className="text-3xl font-bold dark:text-white text-slate-900 uppercase font-mono">Welcome to Spacr !</h1>
        <p className="text-slate-500 mb-5">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio vitae vero quisquam officia deserunt! Perferendis, neque necessitatibus nam laboriosam obcaecati vel
          in doloremque ratione iusto odio, dolore consequatur dolores alias.
        </p>
      </div>
      <Separator />
      <div className="w-full h-full flex gap-2 mt-5">
        <div className="w-1/3">
          <Apod />
        </div>
        <div className="w-2/3">
          <Schedule />
        </div>
      </div>
    </div>
  );
}
