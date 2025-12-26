/**
 * @fileoverview Storage - Persistência de dados do jogo
 * Usa MMKV no mobile e localStorage na web
 */

import { Platform } from "react-native";

/** Chaves de armazenamento */
const STORAGE_KEYS = {
    TOTAL_MONEY: "corre-da-taxa:totalMoney",
    HIGH_SCORE: "corre-da-taxa:highScore",
    SETTINGS: "corre-da-taxa:settings",
} as const;

/** Valor inicial do dinheiro para novos jogadores */
const INITIAL_MONEY = 0;

// ============================================
// Storage Abstraction (Web uses localStorage, Mobile uses MMKV)
// ============================================

interface StorageAdapter {
    getNumber: (key: string) => number | null;
    setNumber: (key: string, value: number) => void;
    getString: (key: string) => string | null;
    setString: (key: string, value: string) => void;
    clearAll: () => void;
}

/** Adapter para Web usando localStorage */
const webStorageAdapter: StorageAdapter = {
    getNumber: (key: string) => {
        if (typeof window === "undefined") return null;
        const value = localStorage.getItem(key);
        return value ? parseFloat(value) : null;
    },
    setNumber: (key: string, value: number) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(key, value.toString());
    },
    getString: (key: string) => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(key);
    },
    setString: (key: string, value: string) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(key, value);
    },
    clearAll: () => {
        if (typeof window === "undefined") return;
        Object.values(STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });
    },
};

/** Usa o adapter apropriado baseado na plataforma */
const storage: StorageAdapter = webStorageAdapter;

// Nota: Para mobile com MMKV, você precisaria:
// if (Platform.OS !== 'web') {
//   const { MMKV } = require('react-native-mmkv');
//   const mmkv = new MMKV({ id: 'corre-da-taxa' });
//   storage = { ... adapter usando mmkv ... }
// }

// ============================================
// Dinheiro Total (Saldo Bancário)
// ============================================

export function saveTotalMoney(amount: number): void {
    storage.setNumber(STORAGE_KEYS.TOTAL_MONEY, amount);
}

export function getTotalMoney(): number {
    return storage.getNumber(STORAGE_KEYS.TOTAL_MONEY) ?? INITIAL_MONEY;
}

export function addToTotalMoney(amount: number): number {
    const current = getTotalMoney();
    const newTotal = current + amount;
    saveTotalMoney(newTotal);
    return newTotal;
}

// ============================================
// High Score (Recorde de Distância)
// ============================================

export function saveHighScore(distance: number): void {
    storage.setNumber(STORAGE_KEYS.HIGH_SCORE, distance);
}

export function getHighScore(): number {
    return storage.getNumber(STORAGE_KEYS.HIGH_SCORE) ?? 0;
}

export function updateHighScoreIfBetter(distance: number): boolean {
    const currentHighScore = getHighScore();
    if (distance > currentHighScore) {
        saveHighScore(distance);
        return true;
    }
    return false;
}

// ============================================
// Configurações
// ============================================

interface GameSettings {
    readonly soundEnabled: boolean;
    readonly musicEnabled: boolean;
    readonly vibrationEnabled: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
};

export function saveSettings(settings: GameSettings): void {
    storage.setString(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getSettings(): GameSettings {
    const raw = storage.getString(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;

    try {
        return JSON.parse(raw) as GameSettings;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function clearAllData(): void {
    storage.clearAll();
}
