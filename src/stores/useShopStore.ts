/**
 * @fileoverview Shop Store - Gerencia inventário e compras
 * Catálogo de itens: Educação (multiplicadores) e Veículos (defesa)
 * Persistência via storage.ts
 */

import { create } from "zustand";
import { useGameStore } from "./useGameStore";

// ============================================
// Tipos
// ============================================

/** Tipos de itens na loja */
export const enum ItemType {
    EDUCATION = "EDUCATION",
    VEHICLE = "VEHICLE",
    POWERUP = "POWERUP",
}

/** Definição de um item do catálogo */
export interface ShopItem {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: ItemType;
    readonly cost: number;
    readonly icon: string;
    /** Multiplicador de moedas (para EDUCATION) */
    readonly multiplier?: number;
    /** Pontos de defesa (para VEHICLE) */
    readonly defense?: number;
}

/** Resultado de uma tentativa de compra */
export interface PurchaseResult {
    readonly success: boolean;
    readonly message: string;
}

// ============================================
// Catálogo de Itens (Dados Estáticos)
// ============================================

export const SHOP_CATALOG: readonly ShopItem[] = [
    // Educação - Multiplicadores de moeda
    {
        id: "edu_1",
        name: "Curso de Inglês",
        description: "Multiplica seus ganhos por 1.2x durante a corrida.",
        type: ItemType.EDUCATION,
        cost: 500,
        icon: "📚",
        multiplier: 1.2,
    },
    {
        id: "edu_2",
        name: "Curso Técnico",
        description: "Multiplica seus ganhos por 1.4x. Profissão garantida!",
        type: ItemType.EDUCATION,
        cost: 1200,
        icon: "🛠️",
        multiplier: 1.4,
    },
    {
        id: "edu_3",
        name: "Faculdade EAD",
        description: "Multiplica seus ganhos por 1.6x. Diploma na mão!",
        type: ItemType.EDUCATION,
        cost: 2500,
        icon: "🎓",
        multiplier: 1.6,
    },
    {
        id: "edu_4",
        name: "Pós-Graduação",
        description: "Multiplica seus ganhos por 2x. Elite intelectual!",
        type: ItemType.EDUCATION,
        cost: 5000,
        icon: "👨‍🎓",
        multiplier: 2.0,
    },

    // Veículos - Defesa (absorve hits)
    {
        id: "veh_1",
        name: "Bicicleta",
        description: "Absorve 1 hit de taxa. Ecologicamente correto!",
        type: ItemType.VEHICLE,
        cost: 800,
        icon: "🚲",
        defense: 1,
    },
    {
        id: "veh_2",
        name: "Patinete Elétrico",
        description: "Absorve 2 hits. Modernidade acessível!",
        type: ItemType.VEHICLE,
        cost: 1500,
        icon: "🛴",
        defense: 2,
    },
    {
        id: "veh_3",
        name: "Uno com Escada",
        description: "Absorve 3 hits. O clássico brasileiro!",
        type: ItemType.VEHICLE,
        cost: 3000,
        icon: "🚗",
        defense: 3,
    },
    {
        id: "veh_4",
        name: "Blindado Anti-Imposto",
        description: "Absorve 5 hits. Proteção premium!",
        type: ItemType.VEHICLE,
        cost: 8000,
        icon: "🚙",
        defense: 5,
    },
] as const;

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEY = "corre-da-taxa:inventory";

/** Carrega inventário do localStorage */
function loadInventory(): string[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as string[];
    } catch {
        return [];
    }
}

/** Salva inventário no localStorage */
function saveInventory(inventory: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

// ============================================
// Store
// ============================================

interface ShopStoreState {
    /** IDs dos itens comprados */
    readonly inventory: readonly string[];
    /** Aba selecionada */
    readonly selectedTab: ItemType;
}

interface ShopStoreActions {
    /** Carrega inventário do storage */
    loadInventory: () => void;
    /** Muda aba selecionada */
    setSelectedTab: (tab: ItemType) => void;
    /** Tenta comprar um item */
    buyItem: (itemId: string) => PurchaseResult;
    /** Verifica se item foi comprado */
    hasItem: (itemId: string) => boolean;
    /** Calcula multiplicador total de educação */
    getTotalMultiplier: () => number;
    /** Calcula defesa total de veículos */
    getTotalDefense: () => number;
}

type ShopStore = ShopStoreState & ShopStoreActions;

const INITIAL_STATE: ShopStoreState = {
    inventory: [],
    selectedTab: ItemType.EDUCATION,
};

export const useShopStore = create<ShopStore>((set, get) => ({
    ...INITIAL_STATE,

    loadInventory: () => {
        const inventory = loadInventory();
        set({ inventory });
    },

    setSelectedTab: (tab) => set({ selectedTab: tab }),

    buyItem: (itemId: string): PurchaseResult => {
        const { inventory, hasItem } = get();

        // Verifica se já tem o item
        if (hasItem(itemId)) {
            return { success: false, message: "Você já possui este item!" };
        }

        // Busca item no catálogo
        const item = SHOP_CATALOG.find((i) => i.id === itemId);
        if (!item) {
            return { success: false, message: "Item não encontrado!" };
        }

        // Verifica saldo
        const { totalMoney, setTotalMoney } = useGameStore.getState();
        if (totalMoney < item.cost) {
            return { success: false, message: "Saldo insuficiente!" };
        }

        // Realiza a compra
        const newTotalMoney = totalMoney - item.cost;
        setTotalMoney(newTotalMoney);

        // Adiciona ao inventário
        const newInventory = [...inventory, itemId];
        saveInventory(newInventory);
        set({ inventory: newInventory });

        return { success: true, message: `${item.name} comprado com sucesso!` };
    },

    hasItem: (itemId: string): boolean => {
        return get().inventory.includes(itemId);
    },

    getTotalMultiplier: (): number => {
        const { inventory } = get();
        let multiplier = 1;

        inventory.forEach((itemId) => {
            const item = SHOP_CATALOG.find((i) => i.id === itemId);
            if (item?.type === ItemType.EDUCATION && item.multiplier) {
                // Multiplicadores são somados (1.2 + 1.4 = 2.6x)
                multiplier += item.multiplier - 1;
            }
        });

        return multiplier;
    },

    getTotalDefense: (): number => {
        const { inventory } = get();
        let defense = 0;

        inventory.forEach((itemId) => {
            const item = SHOP_CATALOG.find((i) => i.id === itemId);
            if (item?.type === ItemType.VEHICLE && item.defense) {
                defense += item.defense;
            }
        });

        return defense;
    },
}));

// ============================================
// Helpers
// ============================================

/** Retorna itens filtrados por tipo */
export function getItemsByType(type: ItemType): readonly ShopItem[] {
    return SHOP_CATALOG.filter((item) => item.type === type);
}
