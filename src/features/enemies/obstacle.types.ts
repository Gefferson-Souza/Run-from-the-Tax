/**
 * @fileoverview Tipos e constantes para o sistema de obstáculos
 * Define enums fortemente tipados para evitar Magic Strings
 */

/** Tipos de obstáculos no jogo */
export const enum ObstacleType {
    TAX = "TAX",
    COIN = "COIN",
}

/** Pistas disponíveis (usando números para facilitar cálculos) */
export const enum LanePosition {
    LEFT = -1,
    CENTER = 0,
    RIGHT = 1,
}

/** Interface de um obstáculo no jogo */
export interface ObstacleData {
    /** ID único do obstáculo */
    readonly id: string;
    /** Tipo: TAX (dano) ou COIN (moeda) */
    readonly type: ObstacleType;
    /** Pista onde está (-1, 0, 1) */
    readonly lane: LanePosition;
    /** Posição Z atual (profundidade) */
    zPosition: number;
    /** Se foi coletado/atingido */
    isCollected: boolean;
}

/** Constantes de gameplay */
export const OBSTACLE_CONSTANTS = {
    /** Posição Z inicial (horizonte) */
    SPAWN_Z: -60,
    /** Posição Z para remoção (passou da câmera) */
    CLEANUP_Z: 10,
    /** Intervalo base de spawn (ms) */
    BASE_SPAWN_INTERVAL_MS: 1500,
    /** Intervalo mínimo de spawn (ms) */
    MIN_SPAWN_INTERVAL_MS: 500,
    /** Chance de spawnar moeda (0-1) */
    COIN_CHANCE: 0.2,
    /** Dano ao colidir com TAX */
    TAX_DAMAGE: 100,
    /** Pontos ao coletar COIN */
    COIN_VALUE: 50,
    /** Distância de colisão no eixo Z */
    COLLISION_THRESHOLD_Z: 1.2,
    /** Posição X por pista */
    LANE_X_POSITIONS: {
        [LanePosition.LEFT]: -2,
        [LanePosition.CENTER]: 0,
        [LanePosition.RIGHT]: 2,
    },
} as const;

/** Cores dos obstáculos */
export const OBSTACLE_COLORS = {
    TAX: "#ef4444",
    COIN: "#fbbf24",
} as const;
