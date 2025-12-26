/**
 * @fileoverview GameLoop Component - Gerencia spawn, movimento e colisão
 * Roda no useFrame do R3F para máxima performance
 * Não renderiza elementos visuais, apenas lógica
 */

import { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore, usePlayerStore, useObstacleStore } from "../../stores";
import {
    ObstacleType,
    LanePosition,
    OBSTACLE_CONSTANTS,
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

interface GameLoopProps {
    /** Callback quando colidir com TAX */
    readonly onTaxCollision?: () => void;
    /** Callback quando coletar COIN */
    readonly onCoinCollected?: () => void;
}

export function GameLoop({
    onTaxCollision,
    onCoinCollected,
}: GameLoopProps): null {
    // Refs para evitar re-renders
    const lastSpawnTimeRef = useRef<number>(Date.now());
    const distanceRef = useRef<number>(0);

    // Stores - usando getState para evitar subscriptions
    const gameStore = useGameStore;
    const playerStore = usePlayerStore;
    const obstacleStore = useObstacleStore;

    useFrame((_, delta) => {
        const { speed, gameState, addScore, addMoney, loseMoney, setSpeed } = gameStore.getState();
        const { currentLane } = playerStore.getState();
        const {
            obstacles,
            spawnObstacle,
            cleanupObstacles,
            removeObstacle,
            spawnInterval,
            decreaseSpawnInterval,
        } = obstacleStore.getState();

        // Só roda se o jogo estiver ativo
        if (gameState !== "RUNNING") return;

        const now = Date.now();

        // --- SPAWN ---
        if (now - lastSpawnTimeRef.current > spawnInterval) {
            spawnObstacle();
            lastSpawnTimeRef.current = now;
        }

        // --- MOVIMENTO ---
        const moveAmount = speed * delta * 15; // Velocidade de movimento

        // Atualiza distância
        distanceRef.current += moveAmount;
        gameStore.getState().addScore(Math.floor(moveAmount));

        // Move obstáculos (eles vêm em direção ao player)
        obstacles.forEach((obs) => {
            if (obs.isCollected) return;

            // Atualiza posição
            obs.zPosition += moveAmount;

            // --- COLISÃO ---
            const playerLanePos = LANE_TO_POSITION[currentLane];
            const isInSameLane = obs.lane === playerLanePos;
            const isInCollisionRange =
                Math.abs(obs.zPosition - PLAYER_Z) < OBSTACLE_CONSTANTS.COLLISION_THRESHOLD_Z;

            if (isInSameLane && isInCollisionRange && !obs.isCollected) {
                if (obs.type === ObstacleType.TAX) {
                    // Colidiu com taxa - perde dinheiro
                    loseMoney(OBSTACLE_CONSTANTS.TAX_DAMAGE);
                    removeObstacle(obs.id);
                    onTaxCollision?.();
                } else if (obs.type === ObstacleType.COIN) {
                    // Coletou moeda - ganha DINHEIRO
                    addMoney(OBSTACLE_CONSTANTS.COIN_VALUE);
                    removeObstacle(obs.id);
                    onCoinCollected?.();
                }
            }
        });

        // Force update para mover obstáculos no estado
        const moveZ = moveAmount;
        obstacleStore.getState().updateObstacles(moveZ);

        // --- CLEANUP ---
        cleanupObstacles();

        // --- DIFICULDADE ---
        // A cada 500 pontos, aumenta velocidade e diminui intervalo de spawn
        if (distanceRef.current > 500) {
            distanceRef.current = 0;
            if (speed < 3) {
                setSpeed(speed + 0.1);
            }
            decreaseSpawnInterval();
        }
    });

    // Componente não renderiza nada visualmente
    return null;
}
