import type { ImgHTMLAttributes } from "react";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {}

export const Image = ({ src, alt, ...props }: Props) => {
  return <img src={src} alt={alt} {...props} className="object-cover w-100" />;
};
