/**
 * @fileoverview Tipos e constantes para o sistema de obstáculos
 * Define enums fortemente tipados para evitar Magic Strings
 * 
 * CATEGORIAS:
 * - LETHAL: Morte instantânea (Game Over)
 * - FINANCIAL: Dano financeiro (pode ficar devendo)
 * - COLLECTIBLE: Coletáveis (moedas)
 */

/** Tipos de obstáculos no jogo */
export const enum ObstacleType {
    /** Obstáculo letal - Game Over imediato */
    DANGER = "DANGER",
    /** Obstáculo financeiro - tira dinheiro */
    TAX = "TAX",
    /** Coletável - dá dinheiro */
    COIN = "COIN",
}

/** Categoria de dano */
export const enum DamageCategory {
    LETHAL = "LETHAL",
    FINANCIAL = "FINANCIAL",
    COLLECTIBLE = "COLLECTIBLE",
}

/** Pistas disponíveis (usando números para facilitar cálculos) */
export const enum LanePosition {
    LEFT = -1,
    CENTER = 0,
    RIGHT = 1,
}

/** Mapeamento de tipo para categoria */
export const OBSTACLE_CATEGORY: Readonly<Record<ObstacleType, DamageCategory>> = {
    [ObstacleType.DANGER]: DamageCategory.LETHAL,
    [ObstacleType.TAX]: DamageCategory.FINANCIAL,
    [ObstacleType.COIN]: DamageCategory.COLLECTIBLE,
} as const;

/** Interface de um obstáculo no jogo */
export interface ObstacleData {
    /** ID único do obstáculo */
    readonly id: string;
    /** Tipo: DANGER (morte), TAX (dano) ou COIN (moeda) */
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
    /** Chances de spawn (deve somar 1.0) */
    SPAWN_CHANCES: {
        DANGER: 0.15, // 15% chance de morte
        TAX: 0.60,    // 60% chance de taxa
        COIN: 0.25,   // 25% chance de moeda
    },
    /** Dano da TAX */
    TAX_DAMAGE: 150,
    /** Valor da COIN */
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
    DANGER: "#7c3aed", // Roxo - perigo mortal
    TAX: "#ef4444",    // Vermelho - dinheiro
    COIN: "#fbbf24",   // Dourado
} as const;

/** Causa da morte (para Game Over) */
export const enum DeathCause {
    /** Colidiu com obstáculo letal */
    LETHAL_COLLISION = "LETHAL_COLLISION",
    /** Desistiu (pausa -> sair) */
    QUIT = "QUIT",
}
