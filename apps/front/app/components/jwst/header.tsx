import type { JSX } from "react";

export function Header(): JSX.Element {
  return (
    <div className="w-full h-auto">
      <h1 className="text-3xl font-bold text-slate-900">
        James Webb Space Telescope
      </h1>
      <div className="flex gap-10 mt-5">
        <p className="mt-2 w-full">
          The James Webb Space Telescope (JWST) is a cutting-edge space
          observatory designed to explore the universe's origins, study distant
          galaxies, and observe the formation of stars and planets. Equipped
          with advanced infrared technology, JWST can peer through cosmic dust
          and detect faint, distant objects that are billions of years old.
          Scientists use it to uncover the secrets of the early universe,
          investigate the atmospheres of exoplanets, and gain deeper insights
          into the evolution of galaxies, stars, and planetary systems.
        </p>
      </div>
      <div className="flex justify-between mt-5">
        <div className="text-sm text-slate-600 flex gap-1">
          <p>Credits :</p>
          <a
            href="https://esawebb.org/"
            target="_blank"
            className="underline hover:cursor-pointer"
            rel="noreferrer"
          >
            ESA/Webb
          </a>
        </div>
      </div>
    </div>
  );
}
