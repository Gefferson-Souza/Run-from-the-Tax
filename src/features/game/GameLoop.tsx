/**
 * @fileoverview GameLoop Component - Gerencia spawn, movimento e colisão
 * 
 * TIPOS DE COLISÃO:
 * - DANGER: Morte instantânea (Game Over)
 * - TAX: Dano financeiro (pode ficar devendo)
 * - COIN: Coletável (ganha dinheiro)
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore, usePlayerStore, useObstacleStore, GameState } from "../../stores";
import {
    ObstacleType,
    LanePosition,
    OBSTACLE_CONSTANTS,
    DamageCategory,
    OBSTACLE_CATEGORY,
} from "../enemies/obstacle.types";
import { Lane } from "../../stores/usePlayerStore";

/** Mapeia Lane do player para LanePosition dos obstáculos */
const LANE_TO_POSITION: Readonly<Record<Lane, LanePosition>> = {
    [Lane.LEFT]: LanePosition.LEFT,
    [Lane.CENTER]: LanePosition.CENTER,
    [Lane.RIGHT]: LanePosition.RIGHT,
} as const;

/** Posição Z do player (fixo, o mundo se move) */
const PLAYER_Z = 0;

/** Multiplicador de velocidade para distância */
const DISTANCE_MULTIPLIER = 15;

interface GameLoopProps {
    /** Callback quando colidir com TAX (dano financeiro) */
    readonly onTaxCollision?: () => void;
    /** Callback quando coletar COIN */
    readonly onCoinCollected?: () => void;
    /** Callback quando morrer (DANGER) */
    readonly onDeath?: () => void;
}

export function GameLoop({
    onTaxCollision,
    onCoinCollected,
    onDeath,
}: GameLoopProps): null {
    // Refs para evitar re-renders
    const lastSpawnTimeRef = useRef<number>(Date.now());
    const difficultyDistanceRef = useRef<number>(0);

    // Stores - usando getState para evitar subscriptions
    const gameStore = useGameStore;
    const playerStore = usePlayerStore;
    const obstacleStore = useObstacleStore;

    useFrame((_, delta) => {
        const state = gameStore.getState();
        const { speed, gameState, addScore, addMoney, loseMoney, setSpeed, dieFromCollision } = state;
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

        // Só roda se o jogo estiver ativo
        if (gameState !== GameState.RUNNING) return;

        const now = Date.now();

        // --- SPAWN ---
        if (now - lastSpawnTimeRef.current > spawnInterval) {
            spawnObstacle();
            lastSpawnTimeRef.current = now;
        }

        // --- MOVIMENTO E DISTÂNCIA ---
        const moveAmount = speed * delta * DISTANCE_MULTIPLIER;

        // Adiciona distância (score) a cada frame
        addScore(Math.ceil(moveAmount));

        // Acumula para cálculo de dificuldade
        difficultyDistanceRef.current += moveAmount;

        // Lane do player
        const playerLanePos = LANE_TO_POSITION[currentLane];

        // --- COLISÃO ---
        obstacles.forEach((obs) => {
            if (obs.isCollected) return;

            // Verifica colisão
            const isInSameLane = obs.lane === playerLanePos;
            const isInCollisionRange =
                Math.abs(obs.zPosition + moveAmount - PLAYER_Z) < OBSTACLE_CONSTANTS.COLLISION_THRESHOLD_Z;

            if (isInSameLane && isInCollisionRange) {
                const category = OBSTACLE_CATEGORY[obs.type];

                switch (category) {
                    case DamageCategory.LETHAL:
                        // MORTE INSTANTÂNEA
                        removeObstacle(obs.id);
                        dieFromCollision();
                        onDeath?.();
                        break;

                    case DamageCategory.FINANCIAL:
                        // DANO FINANCEIRO (pode ficar negativo)
                        loseMoney(OBSTACLE_CONSTANTS.TAX_DAMAGE);
                        removeObstacle(obs.id);
                        onTaxCollision?.();
                        break;

                    case DamageCategory.COLLECTIBLE:
                        // COLETÁVEL (ganha dinheiro)
                        addMoney(OBSTACLE_CONSTANTS.COIN_VALUE);
                        removeObstacle(obs.id);
                        onCoinCollected?.();
                        break;
                }
            }
        });

        // Atualiza posição dos obstáculos no estado
        updateObstacles(moveAmount);

        // --- CLEANUP ---
        cleanupObstacles();

        // --- DIFICULDADE ---
        // A cada 500m, aumenta velocidade e diminui intervalo de spawn
        if (difficultyDistanceRef.current > 500) {
            difficultyDistanceRef.current = 0;
            if (speed < 3) {
                setSpeed(speed + 0.1);
            }
            decreaseSpawnInterval();
        }
    });

    // Componente não renderiza nada visualmente
    return null;
}
