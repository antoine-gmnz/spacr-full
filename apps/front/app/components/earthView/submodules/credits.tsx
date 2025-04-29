import React from "react";

export function Credits(): JSX.Element {
  return (
    <div className="absolute bottom-5 right-5 bg-slate-200 rounded-xl h-auto w-auto p-3">
      <p className="text-xs text-slate-600">
        Data from :{" "}
        <a
          className="underline"
          href="https://tle.ivanstanojevic.me/"
          rel="noopener"
          target="_blank"
        >
          Ivan Stanojevic
        </a>{" "}
        {" / "}
        <a
          className="underline"
          href="https://celestrak.org/"
          rel="noopener"
          target="_blank"
        >
          Celestrak
        </a>
      </p>
    </div>
  );
}
