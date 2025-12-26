/**
 * @fileoverview Definições de tipo para o sistema de áudio
 */

export enum SoundEffect {
    JUMP = "jump",
    COLLECT_COIN = "collect_coin",
    COLLECT_POWERUP = "collect_powerup",
    CRASH_LETHAL = "crash_lethal",
    CRASH_FINANCIAL = "crash_financial",
    GAME_OVER = "game_over",
    UI_CLICK = "ui_click",
}

export enum MusicTrack {
    MAIN_MENU = "main_menu",
    GAMEPLAY_CITY = "gameplay_city",
    GAMEPLAY_FAVELA = "gameplay_favela",
    GAMEPLAY_RURAL = "gameplay_rural",
}

export interface AudioAssetConfig {
    readonly uri: string | number; // require() returns number, uri string
    readonly volume?: number;
}
