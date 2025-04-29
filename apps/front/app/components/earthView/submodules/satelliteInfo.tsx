import { useSelectedSatellite } from "src/context/satelliteContext";
import React from "react";

export function SatelliteInfo(): JSX.Element | null {
    const { selectedSatellite } = useSelectedSatellite();

    if (!selectedSatellite || Object.values(selectedSatellite).length === 0) {
        return null;
    }

    return (
        <div className="absolute top-5 right-5 bg-slate-200 rounded-xl h-auto w-auto p-3">
            <p className="font-bold">{selectedSatellite.name}</p>
            <p className="text-xs text-slate-400">{selectedSatellite.date}</p>
        </div>
    );
}
