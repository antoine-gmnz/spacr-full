import { Button } from '@/components/ui/button';
import type { JSX } from 'react';

interface Props {
  close: () => void;
}

export function ImageDetails({ close }: Props): JSX.Element {
  return (
    <div className="w-full h-full bg-secondary p-5">
      <h2 className="font-bold">Constellation</h2>
      <p className="">Lorem ipsum</p>
      <Button variant="default" className="hover:cursor-pointer mt-5" onClick={close}>
        Close
      </Button>
    </div>
  );
}
