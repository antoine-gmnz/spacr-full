import type { JSX } from 'react';

interface CardV2Props {
  title: string;
  description: string;
  image: string;
  link: string;
  video: string;
  copyright: string;
}

export function CardV2({ title, description, image, link, video, copyright }: CardV2Props): JSX.Element {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="w-full h-[350px] overflow-hidden relative bg-gray-200 rounded-t-sm">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-2 bg-card p-5 rounded-b-sm">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <div className="flex gap-1 items-baseline">
            <p className="text-xs">Picture by : </p>
            <p className="font-bold text-xs">{copyright}</p>
          </div>
          <p className="text-sm text-gray-500 mt-2 line-clamp-3">{description}</p>
        </div>
        <div className="mt-5">
          <a href={link} target="_blank" className="text-sm text-blue-500">
            View in HD
          </a>
        </div>
      </div>
    </div>
  );
}
