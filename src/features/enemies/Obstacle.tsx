/**
 * @fileoverview Obstacle Component - Renderiza qualquer tipo de obstáculo
 * Agora utiliza Sprites 2D via ObstacleSprite
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import {
    ObstacleType,
    LanePosition,
    DamageCategory,
    OBSTACLE_CONSTANTS,
    getCategory,
} from "./obstacle.types";
import { ObstacleSprite } from "./ObstacleSprite";

interface ObstacleProps {
    readonly type: ObstacleType;
    readonly lane: LanePosition;
    readonly zPosition: number;
    readonly isCollected: boolean;
}

/** Constantes de animação */
const ANIM = {
    // Coletáveis (Flutuando)
    FLOAT_SPEED: 4,
    FLOAT_HEIGHT: 0.2,
    BASE_Y: 0.5, // Altura base ajustada para o sprite
    // Letais (Pulsando perigo)
    DANGER_PULSE: 0.1,
    // Financeiros (Tremendo de medo do leão)
    TAX_SHAKE: 0.05,
} as const;

export function Obstacle({
    type,
    lane,
    zPosition,
    isCollected,
}: ObstacleProps): React.JSX.Element | null {
    const groupRef = useRef<Group>(null);
    const category = getCategory(type);
    const xPosition = OBSTACLE_CONSTANTS.LANE_X_POSITIONS[lane];

    // Animações por categoria
    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        const t = clock.getElapsedTime();

        // 1. Posição Base (pode ser modificada pelas animações)
        let newY = ANIM.BASE_Y;
        let newX = xPosition;

        switch (category) {
            case DamageCategory.COLLECTIBLE:
                // Flutua senoide
                newY = ANIM.BASE_Y + Math.sin(t * ANIM.FLOAT_SPEED) * ANIM.FLOAT_HEIGHT;
                break;

            case DamageCategory.LETHAL:
                // Pulsa tamanho levemente
                const pulse = 1 + Math.sin(t * 10) * ANIM.DANGER_PULSE;
                groupRef.current.scale.setScalar(pulse);
                break;

            case DamageCategory.FINANCIAL:
                // Treme levemente lateralmente
                newX = xPosition + Math.sin(t * 25) * ANIM.TAX_SHAKE;
                break;
        }

        groupRef.current.position.set(newX, newY, zPosition);
    });

    // Não renderiza se foi coletado
    if (isCollected) return null;

    return (
        <group ref={groupRef} position={[xPosition, ANIM.BASE_Y, zPosition]}>
            <ObstacleSprite type={type} />

            {/* Sombra simples no chão */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -ANIM.BASE_Y + 0.02, 0]}>
                <circleGeometry args={[0.4, 32]} />
                <meshBasicMaterial color="black" transparent opacity={0.3} />
            </mesh>
        </group>
    );
}

