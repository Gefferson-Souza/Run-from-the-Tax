/**
 * @fileoverview Player State Store - Gerencia o estado do jogador
 * Responsável por: posição na pista, upgrades permanentes, inventário
 */

import { create } from "zustand";

/** Pistas disponíveis para movimentação */
export const enum Lane {
    LEFT = 0,
    CENTER = 1,
    RIGHT = 2,
}

/** Veículo atual do jogador - influencia velocidade base e visual */
export const enum Vehicle {
    ON_FOOT = "ON_FOOT",
    BICYCLE = "BICYCLE",
    MOTORCYCLE = "MOTORCYCLE",
    CAR_POPULAR = "CAR_POPULAR",
    CAR_LUXURY = "CAR_LUXURY",
}

/** Níveis de educação - influencia multiplicador de pontuação */
export const enum EducationLevel {
    NONE = 0,
    TECHNICAL_COURSE = 1,
    COLLEGE = 2,
    FLUENT_ENGLISH = 3,
}

interface PlayerStoreState {
    /** Pista atual do jogador */
    readonly currentLane: Lane;
    /** Veículo atual (upgrades permanentes) */
    readonly vehicle: Vehicle;
    /** Nível de educação (upgrades permanentes) */
    readonly educationLevel: EducationLevel;
    /** Se o jogador está pulando */
    readonly isJumping: boolean;
    /** Se o jogador está deslizando */
    readonly isSliding: boolean;
    /** Power-ups ativos */
    readonly activePowerUps: readonly string[];
}

interface PlayerStoreActions {
    /** Move o jogador para a esquerda */
    moveLeft: () => void;
    /** Move o jogador para a direita */
    moveRight: () => void;
    /** Define pista diretamente */
    setLane: (lane: Lane) => void;
    /** Inicia pulo */
    jump: () => void;
    /** Encerra pulo */
    land: () => void;
    /** Inicia deslize */
    slide: () => void;
    /** Encerra deslize */
    standUp: () => void;
    /** Atualiza veículo (compra upgrade) */
    setVehicle: (vehicle: Vehicle) => void;
    /** Atualiza educação (compra upgrade) */
    setEducationLevel: (level: EducationLevel) => void;
    /** Adiciona power-up ativo */
    addPowerUp: (powerUp: string) => void;
    /** Remove power-up */
    removePowerUp: (powerUp: string) => void;
    /** Reseta estado para nova partida */
    resetForNewRun: () => void;
}

type PlayerStore = PlayerStoreState & PlayerStoreActions;

const INITIAL_STATE: PlayerStoreState = {
    currentLane: Lane.CENTER,
    vehicle: Vehicle.ON_FOOT,
    educationLevel: EducationLevel.NONE,
    isJumping: false,
    isSliding: false,
    activePowerUps: [],
};

export const usePlayerStore = create<PlayerStore>((set) => ({
    ...INITIAL_STATE,

    moveLeft: () =>
        set((state) => ({
            currentLane: state.currentLane > Lane.LEFT ? state.currentLane - 1 : state.currentLane,
        })),

    moveRight: () =>
        set((state) => ({
            currentLane: state.currentLane < Lane.RIGHT ? state.currentLane + 1 : state.currentLane,
        })),

    setLane: (lane) => set({ currentLane: lane }),

    jump: () => set({ isJumping: true, isSliding: false }),

    land: () => set({ isJumping: false }),

    slide: () => set({ isSliding: true, isJumping: false }),

    standUp: () => set({ isSliding: false }),

    setVehicle: (vehicle) => set({ vehicle }),

    setEducationLevel: (level) => set({ educationLevel: level }),

    addPowerUp: (powerUp) =>
        set((state) => ({
            activePowerUps: [...state.activePowerUps, powerUp],
        })),

    removePowerUp: (powerUp) =>
        set((state) => ({
            activePowerUps: state.activePowerUps.filter((p) => p !== powerUp),
        })),

    resetForNewRun: () =>
        set({
            currentLane: Lane.CENTER,
            isJumping: false,
            isSliding: false,
            activePowerUps: [],
        }),
}));
