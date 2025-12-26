/**
 * @fileoverview Mapa de assets de áudio
 * Mapeia os enums para arquivos reais.
 * COMO USAR: Adicione seus arquivos .mp3/.wav em assets/sounds e importe aqui.
 */

import { SoundEffect, MusicTrack } from "./audio.types";

// TODO: Substituir por require('../../assets/sounds/nome_do_arquivo.mp3') quando tiver os arquivos
export const SOUND_ASSETS: Record<SoundEffect, any> = {
    [SoundEffect.JUMP]: null, // require('../../assets/sounds/jump.mp3'),
    [SoundEffect.COLLECT_COIN]: null,
    [SoundEffect.COLLECT_POWERUP]: null,
    [SoundEffect.CRASH_LETHAL]: null,
    [SoundEffect.CRASH_FINANCIAL]: null,
    [SoundEffect.GAME_OVER]: null,
    [SoundEffect.UI_CLICK]: null,
};

export const MUSIC_ASSETS: Record<MusicTrack, any> = {
    [MusicTrack.MAIN_MENU]: null,
    [MusicTrack.GAMEPLAY_CITY]: null,
    [MusicTrack.GAMEPLAY_FAVELA]: null,
    [MusicTrack.GAMEPLAY_RURAL]: null,
};
