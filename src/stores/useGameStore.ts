/**
 * @fileoverview Game State Store - Gerencia o estado global do jogo
 * Responsável por: pontuação, estado de jogo, dinheiro, tema atual
 * Integrado com MMKV para persistência
 */

import { create } from "zustand";
import {
    getTotalMoney,
    saveTotalMoney,
    getHighScore,
    saveHighScore,
    updateHighScoreIfBetter,
    addToTotalMoney,
} from "../utils/storage";
import { DeathCause } from "../features/enemies/obstacle.types";

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

/** Dinheiro inicial por partida - começa zerado */
const STARTING_MONEY = 0;

/** Limite para Game Over - falência quando dinheiro fica NEGATIVO */
const BANKRUPTCY_THRESHOLD = 0;

interface GameStoreState {
    /** Estado atual do jogo */
    readonly gameState: GameState;
    /** Pontuação da partida atual (distância em metros) */
    readonly score: number;
    /** Dinheiro disponível NA PARTIDA ATUAL */
    readonly currentMoney: number;
    /** Dinheiro total acumulado (persistente via MMKV) */
    readonly totalMoney: number;
    /** Multiplicador de pontuação (educação aumenta) */
    readonly scoreMultiplier: number;
    /** Velocidade atual do jogo (aumenta com o tempo) */
    readonly speed: number;
    /** Tema selecionado */
    readonly theme: GameTheme;
    /** Maior pontuação registrada (persistente via MMKV) */
    readonly highScore: number;
    /** Se bateu recorde nesta partida */
    readonly isNewHighScore: boolean;
    /** Dinheiro coletado nesta partida (para mostrar no Game Over) */
    readonly moneyEarnedThisRun: number;
    /** Causa da morte (para mostrar no Game Over) */
    /** Causa da morte (para mostrar no Game Over) */
    readonly deathCause: string | null;
}

interface GameStoreActions {
    /** Carrega dados persistidos do MMKV */
    loadPersistedData: () => void;
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
    /** Adiciona pontos (distância) */
    addScore: (points: number) => void;
    /** Adiciona dinheiro coletado (moedas) */
    addMoney: (amount: number) => void;
    /** Remove dinheiro (ao colidir) - PODE CAUSAR GAME OVER */
    loseMoney: (amount: number) => void;
    /** Atualiza velocidade do jogo */
    setSpeed: (speed: number) => void;
    /** Muda o tema do jogo */
    setTheme: (theme: GameTheme) => void;
    /** Define o dinheiro total (usado pela loja) */
    setTotalMoney: (amount: number) => void;
    /** Morte por colisão com obstáculo letal */
    dieFromCollision: () => void;
    /** Reinicia a partida após Game Over */
    restartGame: () => void;
}

type GameStore = GameStoreState & GameStoreActions;

const INITIAL_STATE: GameStoreState = {
    gameState: GameState.MENU,
    score: 0,
    currentMoney: STARTING_MONEY,
    totalMoney: 0,
    scoreMultiplier: 1,
    speed: 1,
    theme: GameTheme.BRASIL,
    highScore: 0,
    isNewHighScore: false,
    moneyEarnedThisRun: 0,
    deathCause: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
    ...INITIAL_STATE,

    loadPersistedData: () => {
        const totalMoney = getTotalMoney();
        const highScore = getHighScore();
        set({ totalMoney, highScore });
    },

    startGame: () =>
        set({
            gameState: GameState.RUNNING,
            score: 0,
            currentMoney: STARTING_MONEY,
            speed: 1,
            isNewHighScore: false,
            moneyEarnedThisRun: 0,
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
        const { score, moneyEarnedThisRun, highScore } = get();

        // Atualiza high score se necessário
        const isNewHighScore = updateHighScoreIfBetter(score);
        const newHighScore = isNewHighScore ? score : highScore;

        // Soma dinheiro coletado ao saldo total e persiste
        const newTotalMoney = addToTotalMoney(moneyEarnedThisRun);

        set({
            gameState: GameState.GAME_OVER,
            totalMoney: newTotalMoney,
            highScore: newHighScore,
            isNewHighScore,
        });
    },

    goToMenu: () => set({ gameState: GameState.MENU }),

    addScore: (points) =>
        set((state) => ({
            score: state.score + Math.floor(points * state.scoreMultiplier),
        })),

    addMoney: (amount) =>
        set((state) => ({
            currentMoney: state.currentMoney + amount,
            moneyEarnedThisRun: state.moneyEarnedThisRun + amount,
        })),

    loseMoney: (amount) => {
        const { gameState } = get();

        // Só processa se o jogo estiver rodando
        if (gameState !== GameState.RUNNING) return;

        // Permite ficar negativo (dívida) - NÃO DÁ GAME OVER
        set((state) => ({
            currentMoney: state.currentMoney - amount,
        }));
    },

    /** Morte por colisão com obstáculo letal */
    /** Morte por colisão com obstáculo letal */
    dieFromCollision: (cause?: string) => {
        const { gameState } = get();
        if (gameState !== GameState.RUNNING) return;

        // Seta a causa da morte e chama endGame
        // Se vier uma causa específica (string), usa ela. Senão usa o padrão.
        set({ deathCause: cause || DeathCause.LETHAL_COLLISION });
        get().endGame();
    },

    setSpeed: (speed) => set({ speed }),

    setTheme: (theme) => set({ theme }),

    setTotalMoney: (amount) => {
        saveTotalMoney(amount);
        set({ totalMoney: amount });
    },

    restartGame: () => {
        // Carrega dados persistidos antes de reiniciar
        const totalMoney = getTotalMoney();
        const highScore = getHighScore();

        set({
            gameState: GameState.RUNNING,
            score: 0,
            currentMoney: STARTING_MONEY,
            speed: 1,
            isNewHighScore: false,
            moneyEarnedThisRun: 0,
            totalMoney,
            highScore,
        });
    },
}));
