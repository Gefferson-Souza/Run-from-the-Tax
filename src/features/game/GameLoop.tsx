/**
 * @fileoverview GameLoop - Lógica de jogo com dano inteligente
 * 
 * TIPOS DE COLISÃO:
 * - LETHAL: Morte instantânea
 * - FINANCIAL: Dano fixo ou percentual
 * - COLLECTIBLE: Ganho de dinheiro ou power-up
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore, usePlayerStore, useObstacleStore, GameState } from "../../stores";
import {
    ObstacleType,
    LanePosition,
    DamageCategory,
    FinancialType,
    CollectibleType,
    OBSTACLE_CONSTANTS,
    getCategory,
    getFinancialConfig,
    getCollectibleConfig,
} from "../enemies/obstacle.types";
import { Lane } from "../../stores/usePlayerStore";

/** Mapeia Lane do player para LanePosition */
const LANE_TO_POSITION: Readonly<Record<Lane, LanePosition>> = {
    [Lane.LEFT]: LanePosition.LEFT,
    [Lane.CENTER]: LanePosition.CENTER,
    [Lane.RIGHT]: LanePosition.RIGHT,
} as const;

const PLAYER_Z = 0;
const DISTANCE_MULTIPLIER = 15;

import { SoundEffect } from "../audio/audio.types";
import { useGameAudio } from "../audio/useGameAudio";

interface GameLoopProps {
    readonly onTaxCollision?: () => void;
    readonly onCoinCollected?: () => void;
    readonly onDeath?: () => void;
}

export function GameLoop({
    onTaxCollision,
    onCoinCollected,
    onDeath,
}: GameLoopProps): null {
    const lastSpawnTimeRef = useRef<number>(Date.now());
    const difficultyDistanceRef = useRef<number>(0);

    const gameStore = useGameStore;
    const playerStore = usePlayerStore;
    const obstacleStore = useObstacleStore;
    const { playSfx } = useGameAudio(); // Hook de Áudio

    useFrame((_, delta) => {
        const state = gameStore.getState();
        const {
            speed,
            gameState,
            score,
            currentMoney,
            addScore,
            addMoney,
            loseMoney,
            setSpeed,
            dieFromCollision
        } = state;
        const { currentLane } = playerStore.getState();
        const {
            obstacles,
            spawnObstacle,
            cleanupObstacles,
            removeObstacle,
            updateObstacles,
            spawnInterval,
            decreaseSpawnInterval,
        } = obstacleStore.getState();

        if (gameState !== GameState.RUNNING) return;

        const now = Date.now();

        // --- SPAWN ---
        if (now - lastSpawnTimeRef.current > spawnInterval) {
            spawnObstacle(score); // Passa a distância para ajustar dificuldade
            lastSpawnTimeRef.current = now;
        }

        // --- MOVIMENTO E DISTÂNCIA ---
        const moveAmount = speed * delta * DISTANCE_MULTIPLIER;
        addScore(Math.ceil(moveAmount));
        difficultyDistanceRef.current += moveAmount;

        const playerLanePos = LANE_TO_POSITION[currentLane];

        // --- COLISÃO ---
        obstacles.forEach((obs) => {
            if (obs.isCollected) return;

            const isInSameLane = obs.lane === playerLanePos;
            const isInCollisionRange =
                Math.abs(obs.zPosition + moveAmount - PLAYER_Z) < OBSTACLE_CONSTANTS.COLLISION_THRESHOLD_Z;

            if (isInSameLane && isInCollisionRange) {
                const category = getCategory(obs.type);

                switch (category) {
                    case DamageCategory.LETHAL:
                        removeObstacle(obs.id);
                        dieFromCollision();
                        playSfx(SoundEffect.GAME_OVER);
                        onDeath?.();
                        break;

                    case DamageCategory.FINANCIAL: {
                        const config = getFinancialConfig(obs.type as FinancialType);
                        if (config) {
                            let damage: number;
                            if (config.damageType === "PERCENTAGE") {
                                // Dano percentual baseado no dinheiro atual (absoluto)
                                damage = Math.abs(Math.floor(currentMoney * (config.damageValue / 100)));
                                damage = Math.max(damage, 50); // Mínimo R$ 50 de dano
                            } else {
                                damage = config.damageValue;
                            }
                            loseMoney(damage);
                        } else {
                            loseMoney(100); // Fallback
                        }
                        removeObstacle(obs.id);
                        playSfx(SoundEffect.CRASH_FINANCIAL);
                        onTaxCollision?.();
                        break;
                    }

                    case DamageCategory.COLLECTIBLE: {
                        const config = getCollectibleConfig(obs.type as CollectibleType);
                        if (config) {
                            if (config.rewardType === "MONEY") {
                                addMoney(config.rewardValue);
                            } else {
                                // TODO: Implementar power-ups
                                addMoney(100); // Por enquanto, dá dinheiro
                            }
                        } else {
                            addMoney(50); // Fallback
                        }
                        removeObstacle(obs.id);
                        playSfx(SoundEffect.COLLECT_COIN);
                        onCoinCollected?.();
                        break;
                    }
                }
            }
        });

        updateObstacles(moveAmount);
        cleanupObstacles();

        // --- DIFICULDADE ---
        if (difficultyDistanceRef.current > 500) {
            difficultyDistanceRef.current = 0;
            if (speed < 3) {
                setSpeed(speed + 0.1);
            }
            decreaseSpawnInterval();
        }
    });

    return null;
}
