/**
 * @fileoverview Obstacle Store - Gerencia o array de obstáculos em jogo
 * Performance: Usa zustand para evitar re-renders desnecessários
 * Memory: Remove obstáculos que passaram da câmera
 */

import { create } from "zustand";
import {
    ObstacleData,
    ObstacleType,
    LanePosition,
    OBSTACLE_CONSTANTS,
} from "../features/enemies/obstacle.types";

/** Gera ID único sem dependências externas */
const generateId = (): string =>
    `obs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/** Retorna pista aleatória */
const getRandomLane = (): LanePosition => {
    const lanes = [LanePosition.LEFT, LanePosition.CENTER, LanePosition.RIGHT];
    return lanes[Math.floor(Math.random() * lanes.length)] as LanePosition;
};

/** Retorna tipo de obstáculo baseado em probabilidade */
const getRandomObstacleType = (): ObstacleType => {
    return Math.random() < OBSTACLE_CONSTANTS.COIN_CHANCE
        ? ObstacleType.COIN
        : ObstacleType.TAX;
};

interface ObstacleStoreState {
    /** Array de obstáculos ativos */
    readonly obstacles: readonly ObstacleData[];
    /** Último tempo de spawn (para controle de intervalo) */
    readonly lastSpawnTime: number;
    /** Intervalo atual de spawn (diminui com o tempo) */
    readonly spawnInterval: number;
}

interface ObstacleStoreActions {
    /** Spawna um novo obstáculo */
    spawnObstacle: () => void;
    /** Atualiza posição de todos os obstáculos */
    updateObstacles: (deltaZ: number) => ReadonlyArray<ObstacleData>;
    /** Remove obstáculos que passaram da câmera */
    cleanupObstacles: () => void;
    /** Marca obstáculo como coletado */
    collectObstacle: (id: string) => void;
    /** Remove obstáculo por ID */
    removeObstacle: (id: string) => void;
    /** Reseta todos os obstáculos (novo jogo) */
    resetObstacles: () => void;
    /** Diminui intervalo de spawn (aumenta dificuldade) */
    decreaseSpawnInterval: () => void;
}

type ObstacleStore = ObstacleStoreState & ObstacleStoreActions;

const INITIAL_STATE: ObstacleStoreState = {
    obstacles: [],
    lastSpawnTime: 0,
    spawnInterval: OBSTACLE_CONSTANTS.BASE_SPAWN_INTERVAL_MS,
};

export const useObstacleStore = create<ObstacleStore>((set, get) => ({
    ...INITIAL_STATE,

    spawnObstacle: () => {
        const newObstacle: ObstacleData = {
            id: generateId(),
            type: getRandomObstacleType(),
            lane: getRandomLane(),
            zPosition: OBSTACLE_CONSTANTS.SPAWN_Z,
            isCollected: false,
        };

        set((state) => ({
            obstacles: [...state.obstacles, newObstacle],
            lastSpawnTime: Date.now(),
        }));
    },

    updateObstacles: (deltaZ: number) => {
        const { obstacles } = get();

        // Atualiza posições diretamente (mutação controlada para performance)
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
