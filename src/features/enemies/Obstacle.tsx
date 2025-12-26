/**
 * @fileoverview Obstacle Component - Renderiza DANGER, TAX ou COIN
 * Animações procedurais:
 * - COIN: Gira e flutua suavemente
 * - DANGER: Pulsa ameaçadoramente
 * - TAX: Vibra sutilmente
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MathUtils } from "three";
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

/** Constantes de animação */
const ANIM = {
    /** Moeda: velocidade de rotação */
    COIN_SPIN: 3,
    /** Moeda: velocidade de flutuação */
    COIN_FLOAT_SPEED: 4,
    /** Moeda: altura de flutuação */
    COIN_FLOAT_HEIGHT: 0.15,
    /** Moeda: altura base */
    COIN_BASE_Y: 0.8,
    /** Danger: velocidade de rotação */
    DANGER_SPIN: 1.5,
    /** Danger: intensidade do pulse */
    DANGER_PULSE: 0.2,
    /** Tax: intensidade da vibração */
    TAX_SHAKE: 0.02,
} as const;

export function Obstacle({
    type,
    lane,
    zPosition,
    isCollected,
}: ObstacleProps): React.JSX.Element | null {
    const meshRef = useRef<Mesh>(null);

    // Posição X baseada na pista
    const xPosition = OBSTACLE_CONSTANTS.LANE_X_POSITIONS[lane];

    // Animações por tipo
    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        const t = clock.getElapsedTime();

        switch (type) {
            case ObstacleType.COIN:
                // Gira e flutua
                meshRef.current.rotation.y += ANIM.COIN_SPIN * 0.016;
                meshRef.current.position.y =
                    ANIM.COIN_BASE_Y + Math.sin(t * ANIM.COIN_FLOAT_SPEED) * ANIM.COIN_FLOAT_HEIGHT;
                break;

            case ObstacleType.DANGER:
                // Gira e pulsa (escala oscilante)
                meshRef.current.rotation.y += ANIM.DANGER_SPIN * 0.016;
                const pulse = 1 + Math.sin(t * 6) * ANIM.DANGER_PULSE;
                meshRef.current.scale.setScalar(pulse);
                break;

            case ObstacleType.TAX:
                // Vibra sutilmente (shake)
                meshRef.current.position.x =
                    xPosition + Math.sin(t * 20) * ANIM.TAX_SHAKE;
                break;
        }
    });

    // Não renderiza se foi coletado
    if (isCollected) return null;

    // DANGER: Pirâmide roxa ameaçadora
    if (type === ObstacleType.DANGER) {
        return (
            <mesh
                ref={meshRef}
                position={[xPosition, 0.8, zPosition]}
                castShadow
            >
                <coneGeometry args={[0.6, 1.5, 4]} />
                <meshStandardMaterial
                    color={OBSTACLE_COLORS.DANGER}
                    emissive={OBSTACLE_COLORS.DANGER}
                    emissiveIntensity={0.6}
                />
            </mesh>
        );
    }

    // TAX: Cubo vermelho com cifrão
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

    // COIN: Cilindro dourado girando e flutuando
    return (
        <mesh
            ref={meshRef}
            position={[xPosition, ANIM.COIN_BASE_Y, zPosition]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
        >
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
            <meshStandardMaterial
                color={OBSTACLE_COLORS.COIN}
                emissive={OBSTACLE_COLORS.COIN}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.1}
            />
        </mesh>
    );
}
