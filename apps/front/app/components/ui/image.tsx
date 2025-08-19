import { Loader } from '@/components/ui/loader';
import { useState, type ImgHTMLAttributes } from 'react';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const Image = ({ src, alt, objectFit = 'cover', ...props }: Props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      )}
      <img src={src} alt={alt} {...props} onLoad={() => setLoaded(true)} className={`object-${objectFit} ${props.className ?? ''} ${!loaded ? 'h-0' : 'h-full'}`} />
    </>
  );
};
