import { loadHorizonsVectorsForWwt } from "@/horizons";
import { SolarSystemObjects } from "@wwtelescope/engine-types";

export function useArtemisLocation(
    url: string,
    coordCenter: SolarSystemObjects,
    wwtCenter: SolarSystemObjects,