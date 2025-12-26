import React, { useMemo } from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
    ObstacleType,
    getCategory,
    getLethalConfig,
    getFinancialConfig,
    getCollectibleConfig,
    DamageCategory
} from './obstacle.types';

interface ObstacleSpriteProps {
    type: ObstacleType;
    opacity?: number;
}

/**
 * Componente responsável por renderizar o sprite 2D do obstáculo.
 * Enquanto não temos as imagens finais, ele renderiza um "Placeholder Rico":
 * - Um plano colorido com a cor do obstáculo
 * - O Emoji do obstáculo no centro
 * - Um efeito de brilho/borda dependendo da categoria
 */
export function ObstacleSprite({ type, opacity = 1 }: ObstacleSpriteProps) {
    const category = getCategory(type);

    // Recupera a configuração do obstáculo (cor, emoji, etc.)
    const config = useMemo(() => {
        switch (category) {
            case DamageCategory.LETHAL: return getLethalConfig(type as any);
            case DamageCategory.FINANCIAL: return getFinancialConfig(type as any);
            case DamageCategory.COLLECTIBLE: return getCollectibleConfig(type as any);
            default: return null;
        }
    }, [category, type]);

    if (!config) return null;

    // Tamanho base do sprite
    const scale = 1.5;

    return (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            <group>
                {/* Fundo colorido (Placeholder da Imagem) */}
                <mesh position={[0, 0.75, 0]}>
                    <planeGeometry args={[scale, scale]} />
                    <meshStandardMaterial
                        color={config.color}
                        transparent
                        opacity={0.8 * opacity}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Borda/Outline estilizada */}
                <mesh position={[0, 0.75, -0.05]}>
                    <planeGeometry args={[scale + 0.1, scale + 0.1]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.5 * opacity} />
                </mesh>

                {/* Emoji representando o obstáculo */}
                <Text
                    position={[0, 0.75, 0.1]}
                    fontSize={0.8}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                >
                    {config.emoji}
                </Text>
            </group>
        </Billboard>
    );
}
