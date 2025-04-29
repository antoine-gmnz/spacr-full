import type { JSX } from "react";

export function Header(): JSX.Element {
  return (
    <div className="w-full h-auto">
      <h1 className="text-3xl font-bold text-slate-900">Launch schedule</h1>
      <div className="flex gap-10 mt-5">
        {/* <p className="mt-2 w-full">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio
          vitae vero quisquam officia deserunt! Perferendis, neque
          necessitatibus nam laboriosam obcaecati vel in doloremque ratione
          iusto odio, dolore consequatur dolores alias.
        </p> */}
      </div>
      <div className="flex justify-between mt-5">
        <div className="text-sm text-slate-600 flex gap-1">
          <p>Credits :</p>
          <a
            href="https://thespacedevs.com/"
            target="_blank"
            className="underline hover:cursor-pointer"
            rel="noreferrer"
          >
            The space devs
          </a>
        </div>
      </div>
    </div>
  );
}
