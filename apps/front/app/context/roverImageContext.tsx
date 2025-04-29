import type { JSX, ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { type MarsRoverResponse } from "@/types/rover";

interface RoverImageContextType {
  images: MarsRoverResponse[] | null;
  setImages: React.Dispatch<React.SetStateAction<MarsRoverResponse[] | null>>;
}

const RoverImageContext = createContext<RoverImageContextType | undefined>(
  undefined
);

export function RoverImageProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [images, setImages] = useState<MarsRoverResponse[] | null>(null);

  return (
    <RoverImageContext.Provider value={{ images, setImages }}>
      {children}
    </RoverImageContext.Provider>
  );
}

export const useRoverImageContext = () => {
  const context = useContext(RoverImageContext);
  if (!context) {
    throw new Error(
      "useRoverImageContext must be used within a RoverImageProvider"
    );
  }
  return context;
};
