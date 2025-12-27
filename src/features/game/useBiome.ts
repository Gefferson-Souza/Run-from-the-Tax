/**
 * @fileoverview Hook para gerenciamento de Biomas
 * Determina o bioma atual baseado na pontuação/distância.
 */

import { useMemo } from "react";
import { useGameStore } from "../../stores";
import { GameTheme, BIOME_CONFIGS, BiomeConfig } from "./biome.types";

// Distância para troca de bioma (em metros de score)
const BIOME_CHANGE_INTERVAL = 500;

export function useBiome(): BiomeConfig {
    const score = useGameStore((state) => state.score);

    const theme = useMemo(() => {
        // [MODO DEBUG] Travado em RICH_CITY para performance e estabilidade
        return GameTheme.RICH_CITY;

        /* 
        // Lógica de transição desativada temporariamente
        const cycle = Math.floor(score / BIOME_CHANGE_INTERVAL) % 3;
        switch (cycle) {
            case 0: return GameTheme.RICH_CITY;
            case 1: return GameTheme.FAVELA;
            case 2: return GameTheme.RURAL;
            default: return GameTheme.RICH_CITY;
        }
        */
    }, []); // Sem dependências para não recalcular

    return BIOME_CONFIGS[theme];
}
