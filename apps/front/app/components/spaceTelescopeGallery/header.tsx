import type { JSX } from 'react';

export function Header(): JSX.Element {
  return (
    <div className="w-full h-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-mono uppercase">Space Telescope image gallery</h1>
      <div className="flex mt-5 flex-col gap-1">
        <p className="mt-2 w-full">The Hubble Space Telescope, launched in 1990, revolutionized our view of the cosmos with its stunning images and discoveries.</p>
        <p>
          {' '}
          Building on Hubble's legacy, the James Webb Space Telescope (JWST) was launched in 2021 to explore even deeper into space, using advanced infrared technology to reveal
          the universe's earliest galaxies and study the formation of stars and planets.
        </p>
      </div>
      <div className="flex justify-between mt-5">
        <div className="text-sm text-slate-600 flex gap-1">
          <p>Credits :</p>
          <a href="https://esawebb.org/" target="_blank" className="underline hover:cursor-pointer" rel="noreferrer">
            ESA/Webb
          </a>
          <p> / </p>
          <a href="https://esahubble.org/" target="_blank" className="underline hover:cursor-pointer" rel="noreferrer">
            ESA/Hubble
          </a>
        </div>
      </div>
    </div>
  );
}
