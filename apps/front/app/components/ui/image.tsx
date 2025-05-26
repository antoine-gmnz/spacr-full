import type { ImgHTMLAttributes } from 'react';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const Image = ({ src, alt, objectFit = 'cover', ...props }: Props) => {
  return <img src={src} alt={alt} {...props} className={`object-${objectFit} w-100 h-100 ${props.className}`} />;
};
