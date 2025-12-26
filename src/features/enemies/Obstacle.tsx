/**
 * @fileoverview Obstacle Component - Renderiza qualquer tipo de obstáculo
 * Suporta LETHAL, FINANCIAL e COLLECTIBLE com visuais e animações diferentes
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MathUtils } from "three";
import {
    ObstacleType,
    LanePosition,
    DamageCategory,
    OBSTACLE_CONSTANTS,
    CATEGORY_COLORS,
    getCategory,
    getLethalConfig,
    getFinancialConfig,
    getCollectibleConfig,
    LethalType,
    FinancialType,
    CollectibleType,
} from "./obstacle.types";

interface ObstacleProps {
    readonly type: ObstacleType;
    readonly lane: LanePosition;
    readonly zPosition: number;
    readonly isCollected: boolean;
}

/** Constantes de animação */
const ANIM = {
    // Coletáveis
    COIN_SPIN: 3,
    COIN_FLOAT_SPEED: 4,
    COIN_FLOAT_HEIGHT: 0.15,
    COIN_BASE_Y: 0.8,
    // Letais
    DANGER_SPIN: 1.5,
    DANGER_PULSE: 0.2,
    // Financeiros
    TAX_SHAKE: 0.02,
} as const;

/** Obtém a cor do obstáculo */
function getObstacleColor(type: ObstacleType): string {
    const category = getCategory(type);

    // Tenta obter cor específica do catálogo
    const lethalConfig = getLethalConfig(type as LethalType);
    if (lethalConfig) return lethalConfig.color;

    const financialConfig = getFinancialConfig(type as FinancialType);
    if (financialConfig) return financialConfig.color;

    const collectibleConfig = getCollectibleConfig(type as CollectibleType);
    if (collectibleConfig) return collectibleConfig.color;

    // Fallback para cor da categoria
    return CATEGORY_COLORS[category];
}

export function Obstacle({
    type,
    lane,
    zPosition,
    isCollected,
}: ObstacleProps): React.JSX.Element | null {
    const meshRef = useRef<Mesh>(null);
    const category = getCategory(type);
    const color = getObstacleColor(type);
    const xPosition = OBSTACLE_CONSTANTS.LANE_X_POSITIONS[lane];

    // Animações por categoria
    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        const t = clock.getElapsedTime();

        switch (category) {
            case DamageCategory.COLLECTIBLE:
                // Gira e flutua
                meshRef.current.rotation.y += ANIM.COIN_SPIN * 0.016;
                meshRef.current.position.y =
                    ANIM.COIN_BASE_Y + Math.sin(t * ANIM.COIN_FLOAT_SPEED) * ANIM.COIN_FLOAT_HEIGHT;
                break;

            case DamageCategory.LETHAL:
                // Gira e pulsa
                meshRef.current.rotation.y += ANIM.DANGER_SPIN * 0.016;
                const pulse = 1 + Math.sin(t * 6) * ANIM.DANGER_PULSE;
                meshRef.current.scale.setScalar(pulse);
                break;

            case DamageCategory.FINANCIAL:
                // Vibra sutilmente
                meshRef.current.position.x =
                    xPosition + Math.sin(t * 20) * ANIM.TAX_SHAKE;
                break;
        }
    });

    // Não renderiza se foi coletado
    if (isCollected) return null;

    // LETHAL: Pirâmide ameaçadora
    if (category === DamageCategory.LETHAL) {
        return (
            <mesh
                ref={meshRef}
                position={[xPosition, 0.8, zPosition]}
                castShadow
            >
                <coneGeometry args={[0.6, 1.5, 4]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.6}
                />
            </mesh>
        );
    }

    // FINANCIAL: Cubo
    if (category === DamageCategory.FINANCIAL) {
        return (
            <mesh
                ref={meshRef}
                position={[xPosition, 0.6, zPosition]}
                castShadow
            >
                <boxGeometry args={[1, 1.2, 0.5]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>
        );
    }

    // COLLECTIBLE: Cilindro girando
    return (
        <mesh
            ref={meshRef}
            position={[xPosition, ANIM.COIN_BASE_Y, zPosition]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
        >
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.1}
            />
        </mesh>
    );
}
