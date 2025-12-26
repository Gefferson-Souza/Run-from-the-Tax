/**
 * @fileoverview Obstacle Component - Renderiza TAX ou COIN
 * Performance: Usa useFrame para animação, ref para manipulação direta
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import {
    ObstacleType,
    LanePosition,
    OBSTACLE_CONSTANTS,
    OBSTACLE_COLORS,
} from "./obstacle.types";

interface ObstacleProps {
    readonly type: ObstacleType;
    readonly lane: LanePosition;
    readonly zPosition: number;
    readonly isCollected: boolean;
}

/** Velocidade de rotação da moeda (rad/s) */
const COIN_ROTATION_SPEED = 2;

export function Obstacle({
    type,
    lane,
    zPosition,
    isCollected,
}: ObstacleProps): React.JSX.Element | null {
    const meshRef = useRef<Mesh>(null);

    // Posição X baseada na pista
    const xPosition = OBSTACLE_CONSTANTS.LANE_X_POSITIONS[lane];

    // Animação de rotação para moedas
    useFrame((_, delta) => {
        if (!meshRef.current || type !== ObstacleType.COIN) return;
        meshRef.current.rotation.y += COIN_ROTATION_SPEED * delta;
    });

    // Não renderiza se foi coletado
    if (isCollected) return null;

    // TAX: Cubo vermelho perigoso
    if (type === ObstacleType.TAX) {
        return (
            <mesh
                ref={meshRef}
                position={[xPosition, 0.6, zPosition]}
                castShadow
            >
                <boxGeometry args={[1, 1.2, 0.5]} />
                <meshStandardMaterial
                    color={OBSTACLE_COLORS.TAX}
                    emissive={OBSTACLE_COLORS.TAX}
                    emissiveIntensity={0.3}
                />
            </mesh>
        );
    }

    // COIN: Cilindro dourado girando
    return (
        <mesh
            ref={meshRef}
            position={[xPosition, 0.8, zPosition]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
        >
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
            <meshStandardMaterial
                color={OBSTACLE_COLORS.COIN}
                emissive={OBSTACLE_COLORS.COIN}
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    );
}
