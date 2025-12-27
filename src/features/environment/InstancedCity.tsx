import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InstancedMesh, Object3D, Color } from "three";
import { Asset } from 'expo-asset';
import { useGameStore } from "../../stores";
import { useBiome } from "../game/useBiome";
import { useGLBModel } from "../3d/loader/useGLBModel";

// Recreating Configs since previous file was deleted
const BUILDING_CONFIGS = {
    RICH_CITY: {
        colors: ["#1a3a5c", "#2c5282", "#1e3a5f", "#0f2b46", "#2d3748"],
        heightRange: [15, 30],
        widthRange: [3, 5],
        spacing: 12,
    },
    LOW_POLY_CITY: {
        colors: ["#dcdcdc", "#a9a9a9", "#808080", "#696969", "#778899"],
        heightRange: [8, 20],
        widthRange: [3, 4],
        spacing: 10,
    },
    RURAL: {
        colors: ["#8b4513", "#a0522d", "#cd853f", "#d2691e", "#f4a460"],
        heightRange: [4, 8],
        widthRange: [3, 6],
        spacing: 30,
    },
    SUBURBS: {
        colors: ["#ffffff", "#f5f5f5", "#e0e0e0", "#b0c4de", "#fffacd"],
        heightRange: [5, 12],
        widthRange: [3, 4],
        spacing: 15,
    },
    SLUMS: {
        colors: ["#555555", "#666666", "#777777", "#4a4a4a", "#8b0000"],
        heightRange: [5, 15],
        widthRange: [2, 3],
        spacing: 8,
    },
} as const;

// Configs
const COUNT = 60; // Número de prédios no pool
const FAR_Z = 200; // Distância de spawn
const DESPAWN_Z = -20; // Distância de remoção (atrás da câmera)

const ASSET_MODULE = require('../../../assets/models/building.glb');

export function InstancedCity(): React.JSX.Element {
    const meshRef = useRef<InstancedMesh>(null);
    const biome = useBiome();
    const configKey = biome.id as keyof typeof BUILDING_CONFIGS;
    const config = BUILDING_CONFIGS[configKey] ?? BUILDING_CONFIGS.SLUMS;

    // Load Asset
    const uri = Asset.fromModule(ASSET_MODULE).uri || '';
    const glb = useGLBModel(uri);

    const { geometry, material } = useMemo(() => {
        const nodes = glb.nodes || {};
        const firstMesh = Object.values(nodes).find((n: any) => n.isMesh) as THREE.Mesh;
        return {
            geometry: firstMesh?.geometry || new THREE.BoxGeometry(1, 1, 1),
            material: firstMesh?.material || new THREE.MeshStandardMaterial({ color: '#444' })
        };
    }, [glb]);

    // State Locais (Object Pooling)
    const instances = useMemo(() => {
        return new Array(COUNT).fill(0).map((_, i) => {
            return {
                x: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20),
                z: (i / COUNT) * FAR_Z,
                scaleY: 10 + Math.random() * 10,
                color: new Color(),
                active: true
            };
        });
    }, []);

    const tempObject = useMemo(() => new Object3D(), []);

    // Inicialização (Setup inicial das cores/matrix)
    useEffect(() => {
        if (!meshRef.current) return;

        instances.forEach((inst, i) => {
            tempObject.position.set(inst.x, inst.scaleY / 2, inst.z);
            tempObject.scale.set(4, inst.scaleY, 4); // Largura 4m fixa
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);

            // Cor inicial
            inst.color.set(config.colors[Math.floor(Math.random() * config.colors.length)]);
            meshRef.current!.setColorAt(i, inst.color);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [config]);


    useFrame((state) => {
        if (!meshRef.current) return;

        const speed = useGameStore.getState().speed;
        const dist = speed * 0.3; // Sync with track scroll

        instances.forEach((inst, i) => {
            inst.z -= dist;

            // Recycle
            if (inst.z < DESPAWN_Z) {
                inst.z = FAR_Z;
                inst.x = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 15);
                inst.scaleY = config.heightRange[0] + Math.random() * (config.heightRange[1] - config.heightRange[0]);

                const palette = config.colors;
                inst.color.set(palette[Math.floor(Math.random() * palette.length)]);
                meshRef.current!.setColorAt(i, inst.color);
                if (meshRef.current!.instanceColor) meshRef.current!.instanceColor.needsUpdate = true;
            }

            // Update Matrix
            tempObject.position.set(inst.x, inst.scaleY / 2, inst.z);
            tempObject.scale.set(5, inst.scaleY, 5);
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, COUNT]}
            castShadow
            receiveShadow
        />
    );
}
