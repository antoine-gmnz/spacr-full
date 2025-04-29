import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import type { SatelliteVectorData } from "src/components/earthView/type";

interface SelectedSatelliteContextType {
    selectedSatellite: SatelliteVectorData | null;
    setSelectedSatellite: (satellite: SatelliteVectorData | null) => void;
}

const SelectedSatelliteContext = createContext<
    SelectedSatelliteContextType | undefined
>(undefined);

export function SelectedSatelliteProvider({
    children,
}: {
    children: ReactNode;
}): JSX.Element {
    const [selectedSatellite, setSelectedSatellite] =
        useState<SatelliteVectorData | null>(null);

    return (
        <SelectedSatelliteContext.Provider
            value={{ selectedSatellite, setSelectedSatellite }}
        >
            {children}
        </SelectedSatelliteContext.Provider>
    );
}

export const useSelectedSatellite = (): SelectedSatelliteContextType => {
    const context = useContext(SelectedSatelliteContext);
    if (!context) {
        throw new Error(
            "useSelectedSatellite must be used within a SelectedSatelliteProvider"
        );
    }
    return context;
};
