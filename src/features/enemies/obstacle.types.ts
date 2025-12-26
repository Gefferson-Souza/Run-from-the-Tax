/**
 * @fileoverview Bestiário Brasileiro - Tipos e Constantes
 * 
 * CATEGORIAS:
 * - LETHAL: Morte instantânea (Game Over)
 * - FINANCIAL: Dano financeiro (pode ficar devendo)
 * - COLLECTIBLE: Coletáveis (moedas e power-ups)
 */

// ============================================
// ENUMS PRINCIPAIS
// ============================================

/** Categorias de dano */
export const enum DamageCategory {
    LETHAL = "LETHAL",
    FINANCIAL = "FINANCIAL",
    COLLECTIBLE = "COLLECTIBLE",
}

/** Tipos de obstáculos LETAIS (morte instantânea) */
export const enum LethalType {
    /** Dois caras numa moto - clássico brasileiro */
    MOTO = "danger_moto",
    /** Marea Turbo fumando */
    MAREA = "danger_marea",
    /** Cachorro caramelo bravo */
    PITBULL = "danger_pitbull",
    /** Bueiro aberto na rua */
    BUEIRO = "danger_bueiro",
    /** Linha de pipa com cerol */
    CEROL = "danger_cerol",
}

/** Tipos de obstáculos FINANCEIROS (dano em dinheiro) */
export const enum FinancialType {
    /** Leão da Receita Federal - dano percentual */
    LEAO = "tax_leao",
    /** Taxa do Pix */
    PIX = "tax_pix",
    /** Pedágio Sem Parar */
    PEDAGIO = "tax_pedagio",
    /** Taxa das Blusinhas (importação) */
    BLUSINHAS = "tax_blusinhas",
    /** IPVA Atrasado */
    IPVA = "tax_ipva",
    /** Boleto Vencido */
    BOLETO = "tax_boleto",
}

/** Tipos de COLETÁVEIS (recompensas) */
export const enum CollectibleType {
    /** Moedinha básica */
    MOEDA = "coin_moeda",
    /** Nota de 100 */
    NOTA = "coin_nota",
    /** Pix recebido */
    PIX = "coin_pix",
    /** Décimo terceiro salário */
    DECIMO = "coin_13",
    /** Power-up: Escudo Anti-Taxa */
    SHIELD = "powerup_shield",
    /** Power-up: Ímã de Dinheiro */
    MAGNET = "powerup_magnet",
}

/** União de todos os tipos de obstáculos */
export type ObstacleType = LethalType | FinancialType | CollectibleType;

/** Causa da morte (para Game Over) */
export const enum DeathCause {
    LETHAL_COLLISION = "LETHAL_COLLISION",
    QUIT = "QUIT",
}

/** Pistas disponíveis */
export const enum LanePosition {
    LEFT = -1,
    CENTER = 0,
    RIGHT = 1,
}

// ============================================
// CONFIGURAÇÕES DAS ENTIDADES
// ============================================

/** Configuração de um obstáculo letal */
interface LethalConfig {
    readonly id: LethalType;
    readonly name: string;
    readonly emoji: string;
    readonly color: string;
    readonly spawnWeight: number;
    readonly deathMessage: string;
}

/** Configuração de um obstáculo financeiro */
interface FinancialConfig {
    readonly id: FinancialType;
    readonly name: string;
    readonly emoji: string;
    readonly color: string;
    readonly damageType: "FIXED" | "PERCENTAGE";
    readonly damageValue: number;
    readonly spawnWeight: number;
}

/** Configuração de um coletável */
interface CollectibleConfig {
    readonly id: CollectibleType;
    readonly name: string;
    readonly emoji: string;
    readonly color: string;
    readonly rewardType: "MONEY" | "POWERUP";
    readonly rewardValue: number;
    readonly spawnWeight: number;
    readonly duration?: number; // Para power-ups (segundos)
}

// ============================================
// CATÁLOGO DE ENTIDADES
// ============================================

/** Obstáculos LETAIS */
export const LETHAL_CATALOG: readonly LethalConfig[] = [
    {
        id: LethalType.MOTO,
        name: "Dois Caras numa Moto",
        emoji: "🏍️",
        color: "#7c3aed",
        spawnWeight: 8,
        deathMessage: "Dois Caras numa Moto",
    },
    {
        id: LethalType.MAREA,
        name: "Marea Turbo",
        emoji: "🚗",
        color: "#6d28d9",
        spawnWeight: 4,
        deathMessage: "Atropelado pelo Marea",
    },
    {
        id: LethalType.PITBULL,
        name: "Cachorro Caramelo",
        emoji: "🐕",
        color: "#8b5cf6",
        spawnWeight: 5,
        deathMessage: "Mordido pelo Caramelo",
    },
    {
        id: LethalType.BUEIRO,
        name: "Bueiro Aberto",
        emoji: "⚫",
        color: "#1f2937",
        spawnWeight: 3,
        deathMessage: "Caiu no Bueiro",
    },
    {
        id: LethalType.CEROL,
        name: "Linha de Pipa",
        emoji: "🪁",
        color: "#a855f7",
        spawnWeight: 2,
        deathMessage: "Cerol na Jugular",
    },
] as const;

/** Obstáculos FINANCEIROS */
export const FINANCIAL_CATALOG: readonly FinancialConfig[] = [
    {
        id: FinancialType.LEAO,
        name: "Leão da Receita",
        emoji: "🦁",
        color: "#dc2626",
        damageType: "PERCENTAGE",
        damageValue: 15, // 15% do total
        spawnWeight: 5,
    },
    {
        id: FinancialType.PIX,
        name: "Taxa do Pix",
        emoji: "📱",
        color: "#ef4444",
        damageType: "FIXED",
        damageValue: 50,
        spawnWeight: 20,
    },
    {
        id: FinancialType.PEDAGIO,
        name: "Pedágio Sem Parar",
        emoji: "🚧",
        color: "#f87171",
        damageType: "FIXED",
        damageValue: 100,
        spawnWeight: 15,
    },
    {
        id: FinancialType.BLUSINHAS,
        name: "Taxa das Blusinhas",
        emoji: "📦",
        color: "#b91c1c",
        damageType: "FIXED",
        damageValue: 150,
        spawnWeight: 10,
    },
    {
        id: FinancialType.IPVA,
        name: "IPVA Atrasado",
        emoji: "📋",
        color: "#991b1b",
        damageType: "FIXED",
        damageValue: 200,
        spawnWeight: 8,
    },
    {
        id: FinancialType.BOLETO,
        name: "Boleto Vencido",
        emoji: "📄",
        color: "#fca5a5",
        damageType: "FIXED",
        damageValue: 75,
        spawnWeight: 15,
    },
] as const;

/** COLETÁVEIS */
export const COLLECTIBLE_CATALOG: readonly CollectibleConfig[] = [
    {
        id: CollectibleType.MOEDA,
        name: "Moedinha",
        emoji: "🪙",
        color: "#fbbf24",
        rewardType: "MONEY",
        rewardValue: 50,
        spawnWeight: 20,
    },
    {
        id: CollectibleType.NOTA,
        name: "Nota de 100",
        emoji: "💵",
        color: "#22c55e",
        rewardType: "MONEY",
        rewardValue: 100,
        spawnWeight: 8,
    },
    {
        id: CollectibleType.PIX,
        name: "Pix Recebido",
        emoji: "📱",
        color: "#4ade80",
        rewardType: "MONEY",
        rewardValue: 75,
        spawnWeight: 5,
    },
    {
        id: CollectibleType.DECIMO,
        name: "Décimo Terceiro",
        emoji: "🎁",
        color: "#f59e0b",
        rewardType: "MONEY",
        rewardValue: 200,
        spawnWeight: 2,
    },
    {
        id: CollectibleType.SHIELD,
        name: "Escudo Anti-Taxa",
        emoji: "🛡️",
        color: "#3b82f6",
        rewardType: "POWERUP",
        rewardValue: 0,
        spawnWeight: 1,
        duration: 5,
    },
    {
        id: CollectibleType.MAGNET,
        name: "Ímã de Dinheiro",
        emoji: "🧲",
        color: "#ec4899",
        rewardType: "POWERUP",
        rewardValue: 0,
        spawnWeight: 1,
        duration: 10,
    },
] as const;

// ============================================
// HELPERS
// ============================================

/** IDs de tipos letais para verificação rápida */
const LETHAL_IDS: readonly string[] = [
    LethalType.MOTO,
    LethalType.MAREA,
    LethalType.PITBULL,
    LethalType.BUEIRO,
    LethalType.CEROL,
];

/** IDs de tipos financeiros para verificação rápida */
const FINANCIAL_IDS: readonly string[] = [
    FinancialType.LEAO,
    FinancialType.PIX,
    FinancialType.PEDAGIO,
    FinancialType.BLUSINHAS,
    FinancialType.IPVA,
    FinancialType.BOLETO,
];

/** Retorna a categoria de um tipo de obstáculo */
export function getCategory(type: ObstacleType): DamageCategory {
    if (LETHAL_IDS.includes(type as string)) {
        return DamageCategory.LETHAL;
    }
    if (FINANCIAL_IDS.includes(type as string)) {
        return DamageCategory.FINANCIAL;
    }
    return DamageCategory.COLLECTIBLE;
}

/** Retorna a configuração de um obstáculo letal */
export function getLethalConfig(type: LethalType): LethalConfig | undefined {
    return LETHAL_CATALOG.find((c) => c.id === type);
}

/** Retorna a configuração de um obstáculo financeiro */
export function getFinancialConfig(type: FinancialType): FinancialConfig | undefined {
    return FINANCIAL_CATALOG.find((c) => c.id === type);
}

/** Retorna a configuração de um coletável */
export function getCollectibleConfig(type: CollectibleType): CollectibleConfig | undefined {
    return COLLECTIBLE_CATALOG.find((c) => c.id === type);
}

// ============================================
// DADOS DE OBSTÁCULO (RUNTIME)
// ============================================

/** Interface de um obstáculo no jogo */
export interface ObstacleData {
    readonly id: string;
    readonly type: ObstacleType;
    readonly lane: LanePosition;
    zPosition: number;
    isCollected: boolean;
}

// ============================================
// CONSTANTES DE GAMEPLAY
// ============================================

export const OBSTACLE_CONSTANTS = {
    /** Posição Z inicial (horizonte) */
    SPAWN_Z: -60,
    /** Posição Z para remoção */
    CLEANUP_Z: 10,
    /** Intervalo base de spawn (ms) */
    BASE_SPAWN_INTERVAL_MS: 1500,
    /** Intervalo mínimo de spawn (ms) */
    MIN_SPAWN_INTERVAL_MS: 500,
    /** Distância de colisão no eixo Z */
    COLLISION_THRESHOLD_Z: 1.2,
    /** Posição X por pista */
    LANE_X_POSITIONS: {
        [LanePosition.LEFT]: -2,
        [LanePosition.CENTER]: 0,
        [LanePosition.RIGHT]: 2,
    },
    /** Pesos de spawn por categoria (deve somar 100) */
    CATEGORY_WEIGHTS: {
        [DamageCategory.LETHAL]: 15,
        [DamageCategory.FINANCIAL]: 50,
        [DamageCategory.COLLECTIBLE]: 35,
    },
} as const;

/** Cores padrão por categoria */
export const CATEGORY_COLORS = {
    [DamageCategory.LETHAL]: "#7c3aed",
    [DamageCategory.FINANCIAL]: "#ef4444",
    [DamageCategory.COLLECTIBLE]: "#fbbf24",
} as const;
