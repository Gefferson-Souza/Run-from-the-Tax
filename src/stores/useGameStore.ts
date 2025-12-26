/**
 * @fileoverview Game State Store - Gerencia o estado global do jogo
 * Responsável por: pontuação, estado de jogo, dinheiro, tema atual
 */

import { create } from "zustand";

/** Estados possíveis do jogo - evita Magic Strings */
export const enum GameState {
    MENU = "MENU",
    RUNNING = "RUNNING",
    PAUSED = "PAUSED",
    GAME_OVER = "GAME_OVER",
}

/** Tema do jogo - influencia inimigos e cenário */
export const enum GameTheme {
    BRASIL = "BRASIL",
    USA = "USA",
}

interface GameStoreState {
    /** Estado atual do jogo */
    readonly gameState: GameState;
    /** Pontuação da partida atual */
    readonly score: number;
    /** Dinheiro coletado na partida atual */
    readonly currentMoney: number;
    /** Dinheiro total acumulado (persistente) */
    readonly totalMoney: number;
    /** Multiplicador de pontuação (educação aumenta) */
    readonly scoreMultiplier: number;
    /** Velocidade atual do jogo (aumenta com o tempo) */
    readonly speed: number;
    /** Tema selecionado */
    readonly theme: GameTheme;
    /** Maior pontuação registrada */
    readonly highScore: number;
}

interface GameStoreActions {
    /** Inicia uma nova partida */
    startGame: () => void;
    /** Pausa o jogo */
    pauseGame: () => void;
    /** Continua o jogo pausado */
    resumeGame: () => void;
    /** Encerra a partida (game over) */
    endGame: () => void;
    /** Volta ao menu principal */
    goToMenu: () => void;
    /** Adiciona pontos */
    addScore: (points: number) => void;
    /** Adiciona dinheiro coletado */
    addMoney: (amount: number) => void;
    /** Remove dinheiro (ao colidir) */
    loseMoney: (amount: number) => void;
    /** Atualiza velocidade do jogo */
    setSpeed: (speed: number) => void;
    /** Muda o tema do jogo */
    setTheme: (theme: GameTheme) => void;
    /** Reseta a partida atual */
    resetCurrentRun: () => void;
}

type GameStore = GameStoreState & GameStoreActions;

const INITIAL_STATE: GameStoreState = {
    gameState: GameState.MENU,
    score: 0,
    currentMoney: 0,
    totalMoney: 0,
    scoreMultiplier: 1,
    speed: 1,
    theme: GameTheme.BRASIL,
    highScore: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
    ...INITIAL_STATE,

    startGame: () =>
        set({
            gameState: GameState.RUNNING,
            score: 0,
            currentMoney: 0,
            speed: 1,
        }),

    pauseGame: () =>
        set((state) =>
            state.gameState === GameState.RUNNING
                ? { gameState: GameState.PAUSED }
                : state
        ),

    resumeGame: () =>
        set((state) =>
            state.gameState === GameState.PAUSED
                ? { gameState: GameState.RUNNING }
                : state
        ),

    endGame: () => {
        const { score, currentMoney, totalMoney, highScore } = get();
        set({
            gameState: GameState.GAME_OVER,
            totalMoney: totalMoney + currentMoney,
            highScore: Math.max(highScore, score),
        });
    },

    goToMenu: () => set({ gameState: GameState.MENU }),

    addScore: (points) =>
        set((state) => ({
            score: state.score + points * state.scoreMultiplier,
        })),

    addMoney: (amount) =>
        set((state) => ({
            currentMoney: state.currentMoney + amount,
        })),

    loseMoney: (amount) =>
        set((state) => ({
            currentMoney: Math.max(0, state.currentMoney - amount),
        })),

    setSpeed: (speed) => set({ speed }),

    setTheme: (theme) => set({ theme }),

    resetCurrentRun: () =>
        set({
            score: 0,
            currentMoney: 0,
            speed: 1,
        }),
}));
