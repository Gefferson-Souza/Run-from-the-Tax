/**
 * @fileoverview Sky Component - Céu dinâmico com gradiente
 * Cria um efeito de céu infinito que muda com o bioma
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBiome } from "../game/useBiome";
import { GameTheme } from "../game/biome.types";

/** Configurações de céu por bioma */
const SKY_CONFIGS: Record<GameTheme, { topColor: string; bottomColor: string; starIntensity: number }> = {
    [GameTheme.RICH_CITY]: {
        topColor: "#0a0a1a",     // Azul escuro noturno
        bottomColor: "#1a1a2e",  // Roxo urbano
        starIntensity: 0.3,       // Poucas estrelas (poluição luminosa)
    },
    [GameTheme.FAVELA]: {
        topColor: "#1a0a0a",     // Vermelho escuro (pôr do sol)
        bottomColor: "#2d1515",  // Laranja/vermelho
        starIntensity: 0.5,
    },
    [GameTheme.RURAL]: {
        topColor: "#000510",     // Preto azulado (noite estrelada)
        bottomColor: "#0a1628",  // Azul profundo
        starIntensity: 1.0,       // Muitas estrelas (céu limpo)
    },
};

/** Cria textura de gradiente para o céu */
function createGradientTexture(topColor: string, bottomColor: string): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(0.5, bottomColor);
        gradient.addColorStop(1, bottomColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function Sky(): React.JSX.Element {
    const meshRef = useRef<THREE.Mesh>(null);
    const biome = useBiome();
    const config = SKY_CONFIGS[biome.id];

    // Cria textura de gradiente
    const gradientTexture = useMemo(() => {
        return createGradientTexture(config.topColor, config.bottomColor);
    }, [config.topColor, config.bottomColor]);

    // Rotação lenta do céu (efeito sutil)
    useFrame((_state: unknown, delta: number) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.01;
        }
    });

    return (
        <group>
            {/* Esfera de céu */}
            <mesh ref={meshRef} scale={[-1, 1, 1]}>
                <sphereGeometry args={[100, 32, 32]} />
                <meshBasicMaterial
                    map={gradientTexture}
                    side={THREE.BackSide}
                    fog={false}
                />
            </mesh>

            {/* Estrelas (pontos de luz) */}
            <Stars intensity={config.starIntensity} />
        </group>
    );
}

/** Componente de estrelas */
function Stars({ intensity }: { intensity: number }): React.JSX.Element | null {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions, colors] = useMemo(() => {
        const count = Math.floor(200 * intensity);
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Posição esférica aleatória (hemisfério superior)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5; // Apenas metade superior
            const radius = 80 + Math.random() * 20;

            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.cos(phi) + 20; // Offset para cima
            pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

            // Cor branca/azulada
            const brightness = 0.5 + Math.random() * 0.5;
            col[i * 3] = brightness;
            col[i * 3 + 1] = brightness;
            col[i * 3 + 2] = brightness + 0.1; // Leve tom azul
        }

        return [pos, col];
    }, [intensity]);

    // Piscar das estrelas
    useFrame(({ clock }: { clock: THREE.Clock }) => {
        if (!pointsRef.current) return;
        const material = pointsRef.current.material as THREE.PointsMaterial;
        material.opacity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    });

    if (intensity < 0.1) return null;

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={1.5}
                transparent
                opacity={0.8}
                vertexColors
                fog={false}
                sizeAttenuation
            />
        </points>
    );
}
