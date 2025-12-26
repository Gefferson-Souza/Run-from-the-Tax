/**
 * @fileoverview Scenery Component - Cenário lateral dinâmico (Parallax)
 * Renderiza prédios ou objetos nas laterais que se movem com a pista.
 * Usa InstancedMesh para performance.
 */

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D, Color, MathUtils } from "three";
import * as THREE from "three"; // Importação correta do namespace
import { useGameStore } from "../../stores";
import { useBiome } from "../game/useBiome";
import { GameTheme } from "../game/biome.types";

const COUNT = 40; // Quantidade de prédios visibles
const SCENERY_SPEED_MULTIPLIER = 1.0; // Velocidade relativa ao chão

export function Scenery() {
    const meshRef = useRef<InstancedMesh>(null);
    const speed = useGameStore((state) => state.speed);
    const biome = useBiome();

    // Configurações do tema atual
    const themeConfig = useMemo(() => {
        if (biome.id === GameTheme.FAVELA) {
            return { color: "#d35400", scaleY: 2, varY: 2, width: 1.5 }; // Tijolo
        } else if (biome.id === GameTheme.RURAL) {
            return { color: "#2e7d32", scaleY: 4, varY: 1, width: 0.5 }; // Árvores (finas)
        } else {
            return { color: "#0984e3", scaleY: 8, varY: 10, width: 2 }; // Prédios vidro
        }
    }, [biome.id]);

    // Dados das "instâncias" (posição inicial)
    const instances = useMemo(() => {
        const temp = [];
        for (let i = 0; i < COUNT; i++) {
            const isLeft = i % 2 === 0;
            const x = (isLeft ? -1 : 1) * (6 + Math.random() * 4); // Distância lateral (8 a 12)
            const z = -50 + (i * 2); // Espalhados na profundidade
            const scaleY = themeConfig.scaleY + Math.random() * themeConfig.varY;

            temp.push({
                x,
                z,
                originalZ: z,
                y: scaleY / 2, // Pivot no chão
                scaleY,
                scaleX: themeConfig.width + Math.random(),
                speedOffset: Math.random() * 0.2 // Variação leve
            });
        }
        return temp;
    }, [biome.id]); // Recria se mudar bioma drasticamente (simples)

    // Dummy Object para atualizar matrizes
    const scratch = useMemo(() => new Object3D(), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Move os prédios
        // NOTA: Em um "Curved World" shader seria melhor, mas aqui movemos na CPU
        const moveDist = speed * delta * 20; // 20 = fator de escala de velocidade visual

        for (let i = 0; i < COUNT; i++) {
            const data = instances[i];

            data.z += moveDist;

            // Recycle: Se passou da câmera, joga lá pro fundo
            if (data.z > 10) {
                data.z = -80; // Respawn lá no fundo
            }

            // Atualiza matriz
            scratch.position.set(data.x, data.y, data.z);
            scratch.scale.set(data.scaleX, data.scaleY, data.scaleX);
            scratch.updateMatrix();
            meshRef.current.setMatrixAt(i, scratch.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;

        // Atualiza cores suavemente (se possível, mas InstancedMesh cor é chato de animar sem shader)
        // Vamos apenas definir a cor base no material
    });

    // Atualiza cor do material quando muda bioma
    useEffect(() => {
        if (meshRef.current) {
            // Cast para MeshStandardMaterial para acessar .color
            (meshRef.current.material as THREE.MeshStandardMaterial).color.set(themeConfig.color);
        }
    }, [themeConfig.color]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color={themeConfig.color}
                emissive={themeConfig.color}
                emissiveIntensity={0.2}
                roughness={0.1}
            />
        </instancedMesh>
    );
}
