/**
 * @fileoverview useAudioStore - Gerenciador de estado global de áudio
 * Mantém o estado de Mute/Volume e fila de efeitos sonoros.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioState {
    readonly isMuted: boolean;
    readonly sfxVolume: number;
    readonly musicVolume: number;
}

interface AudioActions {
    toggleMute: () => void;
    setSfxVolume: (volume: number) => void;
    setMusicVolume: (volume: number) => void;
}

const STORAGE_KEY = "@run_tax:audio_settings";

const zustandStorage = {
    getItem: async (name: string) => {
        const value = await AsyncStorage.getItem(name);
        return value ?? null;
    },
    setItem: async (name: string, value: string) => {
        await AsyncStorage.setItem(name, value);
    },
    removeItem: async (name: string) => {
        await AsyncStorage.removeItem(name);
    },
};

export const useAudioStore = create<AudioState & AudioActions>()(

    persist(
        (set) => ({
            isMuted: false,
            sfxVolume: 1.0,
            musicVolume: 0.8,

            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
            setSfxVolume: (v) => set({ sfxVolume: Math.max(0, Math.min(1, v)) }),
            setMusicVolume: (v) => set({ musicVolume: Math.max(0, Math.min(1, v)) }),
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);
