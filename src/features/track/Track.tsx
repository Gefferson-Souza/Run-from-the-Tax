/**
 * @fileoverview Track Component - Pista infinita com Biomas Brasileiros
 */

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh, RepeatWrapping, TextureLoader, Color } from "three";
import { useGameStore } from "../../stores";
import { useBiome } from "../game/useBiome";
import { generateTrackTexture } from "./TrackMaterial";
import { GameTheme } from "../game/biome.types";

/** Largura da pista */
const TRACK_WIDTH = 8;
/** Comprimento visível da pista */
const TRACK_LENGTH = 50;
/** Velocidade base do scroll da textura */
const BASE_SCROLL_SPEED = 0.02;

export function Track(): React.JSX.Element {
    const planeRef = useRef<Mesh>(null);
    const textureOffsetRef = useRef<number>(0);
    const scene = useThree((state) => state.scene);

    const speed = useGameStore((state) => state.speed);
    const biome = useBiome(); // Hook de Biomas

    // Gera textura procedural baseada no tema atual
    // Recalcula APENAS se o tema mudar
    const texture = useMemo(() => {
        return generateTrackTexture(biome.id);
    }, [biome.id]);

    // Atualiza Fog ao mudar de bioma
    useEffect(() => {
        // Cor do fog
        scene.fog = new THREE.FogExp2(biome.fogColor, 0.02);
        scene.background = new Color(biome.fogColor);
    }, [biome.id, scene]);

    useFrame(() => {
        if (!texture) return;
        // Scroll da textura para simular movimento
        textureOffsetRef.current += BASE_SCROLL_SPEED * speed;
        texture.offset.y = textureOffsetRef.current;
    });

    const isRural = biome.id === GameTheme.RURAL;

    return (
        <group>
            {/* Pista principal */}
            <mesh
                ref={planeRef}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, -TRACK_LENGTH / 2 + 5]}
                receiveShadow
            >
                <planeGeometry args={[TRACK_WIDTH, TRACK_LENGTH]} />
                <meshStandardMaterial map={texture} roughness={isRural ? 0.9 : 0.4} />
            </mesh>

            {/* Calçadas (Apenas se não for rural) */}
            {!isRural && (
                <>
                    {/* Esquerda */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-TRACK_WIDTH / 2 - 1, 0.15, -TRACK_LENGTH / 2 + 5]} receiveShadow>
                        <planeGeometry args={[2, TRACK_LENGTH]} />
                        <meshStandardMaterial color="#b2bec3" roughness={0.8} />
                    </mesh>
                    {/* Direita */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[TRACK_WIDTH / 2 + 1, 0.15, -TRACK_LENGTH / 2 + 5]} receiveShadow>
                        <planeGeometry args={[2, TRACK_LENGTH]} />
                        <meshStandardMaterial color="#b2bec3" roughness={0.8} />
                    </mesh>
                </>
            )}

            {/* Chão Infinito (escuro) para preencher o vazio */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[200, 200]} />
                <meshBasicMaterial color={biome.fogColor} />
            </mesh>
        </group>
    );
}

// Import temporário para fixar o erro de THREE global se não declarado
import * as THREE from 'three';
