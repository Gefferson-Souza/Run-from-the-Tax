/**
 * @fileoverview Obstacle Store - Sistema de spawn inteligente
 * Spawna obstáculos baseado em pesos e dificuldade progressiva
 */

import { create } from "zustand";
import {
    ObstacleData,
    ObstacleType,
    LanePosition,
    DamageCategory,
    LethalType,
    FinancialType,
    CollectibleType,
    LETHAL_CATALOG,
    FINANCIAL_CATALOG,
    COLLECTIBLE_CATALOG,
    OBSTACLE_CONSTANTS,
    getCategory,
} from "../features/enemies/obstacle.types";

// ============================================
// HELPERS DE SPAWN
// ============================================

/** Gera ID único */
const generateId = (): string =>
    `obs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/** Retorna pista aleatória */
const getRandomLane = (): LanePosition => {
    const lanes = [LanePosition.LEFT, LanePosition.CENTER, LanePosition.RIGHT];
    return lanes[Math.floor(Math.random() * lanes.length)] as LanePosition;
};

/**
 * Seleciona um tipo de obstáculo baseado nos pesos
 * Ajusta pesos conforme a distância percorrida
 */
const selectObstacleType = (distance: number): ObstacleType => {
    // Ajusta pesos por distância (mais difícil com o tempo)
    const distanceMultiplier = Math.min(distance / 1000, 2); // Max 2x

    // Pesos base das categorias (Number() para evitar tipo literal)
    let lethalWeight = Number(OBSTACLE_CONSTANTS.CATEGORY_WEIGHTS[DamageCategory.LETHAL]);
    let financialWeight = Number(OBSTACLE_CONSTANTS.CATEGORY_WEIGHTS[DamageCategory.FINANCIAL]);
    let collectibleWeight = Number(OBSTACLE_CONSTANTS.CATEGORY_WEIGHTS[DamageCategory.COLLECTIBLE]);

    // Ajuste progressivo
    lethalWeight += distanceMultiplier * 5;
    financialWeight += distanceMultiplier * 10;
    collectibleWeight -= distanceMultiplier * 10;
    collectibleWeight = Math.max(collectibleWeight, 15); // Mínimo 15%

    // Normaliza para 100%
    const total = lethalWeight + financialWeight + collectibleWeight;
    lethalWeight = (lethalWeight / total) * 100;
    financialWeight = (financialWeight / total) * 100;
    collectibleWeight = (collectibleWeight / total) * 100;

    // Rola o dado
    const roll = Math.random() * 100;

    let selectedCategory: DamageCategory;
    if (roll < lethalWeight) {
        selectedCategory = DamageCategory.LETHAL;
    } else if (roll < lethalWeight + financialWeight) {
        selectedCategory = DamageCategory.FINANCIAL;
    } else {
        selectedCategory = DamageCategory.COLLECTIBLE;
    }

    // Seleciona o tipo específico baseado nos pesos internos
    return selectTypeFromCategory(selectedCategory);
};

/** Seleciona um tipo específico de uma categoria baseado em pesos */
const selectTypeFromCategory = (category: DamageCategory): ObstacleType => {
    let catalog: readonly { id: ObstacleType; spawnWeight: number }[];

    switch (category) {
        case DamageCategory.LETHAL:
            catalog = LETHAL_CATALOG;
            break;
        case DamageCategory.FINANCIAL:
            catalog = FINANCIAL_CATALOG;
            break;
        case DamageCategory.COLLECTIBLE:
            catalog = COLLECTIBLE_CATALOG;
            break;
    }

    // Calcula peso total
    const totalWeight = catalog.reduce((sum, item) => sum + item.spawnWeight, 0);

    // Rola o dado
    let roll = Math.random() * totalWeight;

    // Seleciona baseado no peso
    for (const item of catalog) {
        roll -= item.spawnWeight;
        if (roll <= 0) {
            return item.id;
        }
    }

    // Fallback
    return catalog[0].id;
};

// ============================================
// STORE
// ============================================

interface ObstacleStoreState {
    readonly obstacles: readonly ObstacleData[];
    readonly lastSpawnTime: number;
    readonly spawnInterval: number;
    readonly waveCount: number;
    readonly obstaclesThisWave: number;
}

interface ObstacleStoreActions {
    spawnObstacle: (distance?: number) => void;
    updateObstacles: (deltaZ: number) => ReadonlyArray<ObstacleData>;
    cleanupObstacles: () => void;
    collectObstacle: (id: string) => void;
    removeObstacle: (id: string) => void;
    resetObstacles: () => void;
    decreaseSpawnInterval: () => void;
}

type ObstacleStore = ObstacleStoreState & ObstacleStoreActions;

const INITIAL_STATE: ObstacleStoreState = {
    obstacles: [],
    lastSpawnTime: 0,
    spawnInterval: OBSTACLE_CONSTANTS.BASE_SPAWN_INTERVAL_MS,
    waveCount: 0,
    obstaclesThisWave: 0,
};

export const useObstacleStore = create<ObstacleStore>((set, get) => ({
    ...INITIAL_STATE,

    spawnObstacle: (distance = 0) => {
        const { waveCount, obstaclesThisWave, obstacles } = get();

        // Regra: Max 2 obstáculos por onda
        if (obstaclesThisWave >= 2) {
            set({ obstaclesThisWave: 0, waveCount: waveCount + 1 });
        }

        // Regra: Não spawna LETHAL nas primeiras 3 ondas
        let type = selectObstacleType(distance);
        if (waveCount < 3 && getCategory(type) === DamageCategory.LETHAL) {
            type = selectTypeFromCategory(DamageCategory.FINANCIAL);
        }

        // Regra: Não spawna 2 LETHAL na mesma onda
        const hasLethalThisWave = obstacles.some(
            (o) => getCategory(o.type) === DamageCategory.LETHAL && o.zPosition < -30
        );
        if (hasLethalThisWave && getCategory(type) === DamageCategory.LETHAL) {
            type = selectTypeFromCategory(DamageCategory.FINANCIAL);
        }

        const newObstacle: ObstacleData = {
            id: generateId(),
            type,
            lane: getRandomLane(),
            zPosition: OBSTACLE_CONSTANTS.SPAWN_Z,
            isCollected: false,
        };

        set((state) => ({
            obstacles: [...state.obstacles, newObstacle],
            lastSpawnTime: Date.now(),
            obstaclesThisWave: state.obstaclesThisWave + 1,
        }));
    },

    updateObstacles: (deltaZ: number) => {
        const { obstacles } = get();
        const updatedObstacles = obstacles.map((obs) => ({
            ...obs,
            zPosition: obs.zPosition + deltaZ,
        }));
        set({ obstacles: updatedObstacles });
        return updatedObstacles;
    },

    cleanupObstacles: () => {
        set((state) => ({
            obstacles: state.obstacles.filter(
                (obs) => obs.zPosition < OBSTACLE_CONSTANTS.CLEANUP_Z
            ),
        }));
    },

    collectObstacle: (id: string) => {
        set((state) => ({
            obstacles: state.obstacles.map((obs) =>
                obs.id === id ? { ...obs, isCollected: true } : obs
            ),
        }));
    },

    removeObstacle: (id: string) => {
        set((state) => ({
            obstacles: state.obstacles.filter((obs) => obs.id !== id),
        }));
    },

    resetObstacles: () => {
        set(INITIAL_STATE);
    },

    decreaseSpawnInterval: () => {
        set((state) => ({
            spawnInterval: Math.max(
                OBSTACLE_CONSTANTS.MIN_SPAWN_INTERVAL_MS,
                state.spawnInterval - 50
            ),
        }));
    },
}));
