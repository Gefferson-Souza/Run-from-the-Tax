/**
 * @fileoverview Tipos e Configurações para Biomas Brasileiros
 */

import { MusicTrack } from "../audio/audio.types";

export enum GameTheme {
    RICH_CITY = "RICH_CITY", // Centro Financeiro (Asfalto bom, prédios)
    FAVELA = "FAVELA",       // Periferia (Asfalto ruim, tijolo)
    RURAL = "RURAL",         // Estrada de terra (Terra, mato)
}

export interface BiomeConfig {
    id: GameTheme;
    name: string;
    trackColor: string;
    fogColor: string;
    sceneryType: 'buildings' | 'shacks' | 'trees';
    musicTrack: MusicTrack;
}

export const BIOME_CONFIGS: Record<GameTheme, BiomeConfig> = {
    [GameTheme.RICH_CITY]: {
        id: GameTheme.RICH_CITY,
        name: "Centro Financeiro",
        trackColor: "#2d3436", // Asfalto escuro
        fogColor: "#1a1a1a",   // Noite urbana e poluição
        sceneryType: 'buildings',
        musicTrack: MusicTrack.GAMEPLAY_CITY,
    },
    [GameTheme.FAVELA]: {
        id: GameTheme.FAVELA,
        name: "Comunidade",
        trackColor: "#636e72", // Asfalto cinza gasto
        fogColor: "#2d3436",
        sceneryType: 'shacks',
        musicTrack: MusicTrack.GAMEPLAY_FAVELA,
    },
    [GameTheme.RURAL]: {
        id: GameTheme.RURAL,
        name: "Estrada de Terra",
        trackColor: "#8d6e63", // Terra marrom
        fogColor: "#3e2723",
        sceneryType: 'trees',
        musicTrack: MusicTrack.GAMEPLAY_RURAL,
    },
};
