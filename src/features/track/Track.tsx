/**
 * @fileoverview Track Component - Pista infinita com texturas realistas
 * Usa texturas do Poly Haven para asfalto e suporte a biomas
 */

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh, RepeatWrapping, Texture, Color } from "three";
import * as THREE from "three";
import { useGameStore } from "../../stores";
import { useBiome } from "../game/useBiome";
import { generateTrackTexture } from "./TrackMaterial";
import { GameTheme } from "../game/biome.types";
import { useTextureLoader, GROUND } from "../environment/TextureLibrary";

/** Largura da pista */
const TRACK_WIDTH = 8;
/** Comprimento visível da pista */
const TRACK_LENGTH = 50;
/** Velocidade base do scroll da textura */
const BASE_SCROLL_SPEED = 0.02;

export function Track(): React.JSX.Element {
    const planeRef = useRef<Mesh>(null);
    const textureOffsetRef = useRef<number>(0);
    const scene = useThree((state: { scene: THREE.Scene }) => state.scene);

    const speed = useGameStore((state) => state.speed);
    const biome = useBiome();
    const isRural = biome.id === GameTheme.RURAL;

    // Carrega texturas usando o hook centralizado
    const asphaltDiff = useTextureLoader(GROUND.ASPHALT_DIFF) as Texture | null;
    const asphaltRough = useTextureLoader(GROUND.ASPHALT_ROUGH) as Texture | null;
    // Carrega textura do chão lateral (agora suporta texturas rurais/urbanas)
    const groundDiff = useTextureLoader(isRural ? GROUND.RURAL_GRASS : GROUND.URBAN_CONCRETE) as Texture | null;

    // Configura repetição das texturas
    useEffect(() => {
        if (asphaltDiff) {
            asphaltDiff.wrapS = RepeatWrapping;
            asphaltDiff.wrapT = RepeatWrapping;
            asphaltDiff.repeat.set(2, 8);
            asphaltDiff.colorSpace = THREE.SRGBColorSpace;
        }
        if (asphaltRough) {
            asphaltRough.wrapS = RepeatWrapping;
            asphaltRough.wrapT = RepeatWrapping;
            asphaltRough.repeat.set(2, 8);
        }
        if (groundDiff) {
            groundDiff.wrapS = RepeatWrapping;
            groundDiff.wrapT = RepeatWrapping;
            groundDiff.repeat.set(24, 24);
            groundDiff.colorSpace = THREE.SRGBColorSpace;
        }
    }, [asphaltDiff, asphaltRough, groundDiff]);

    // Fallback para textura procedural
    const proceduralTexture = useMemo(() => {
        return generateTrackTexture(biome.id);
    }, [biome.id]);

    // Textura final (usa asphalt real ou procedural)
    const finalTexture = useMemo(() => {
        if (isRural) {
            return proceduralTexture; // Rural usa textura procedural na pista principal
        }
        return asphaltDiff ?? proceduralTexture;
    }, [isRural, asphaltDiff, proceduralTexture]);

    // Atualiza Fog ao mudar de bioma
    useEffect(() => {
        scene.fog = new THREE.FogExp2(biome.fogColor, 0.02);
        scene.background = new Color(biome.fogColor);
    }, [biome.id, scene]);

    // Scroll da textura
    useFrame(() => {
        if (!finalTexture) return;
        textureOffsetRef.current += BASE_SCROLL_SPEED * speed;
        finalTexture.offset.y = textureOffsetRef.current;

        // Sincroniza roughness
        if (asphaltRough) {
            asphaltRough.offset.y = textureOffsetRef.current;
        }

        // Scroll do chão lateral
        if (groundDiff) {
            groundDiff.offset.y = textureOffsetRef.current;
        }
    });

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
                <meshStandardMaterial
                    map={finalTexture}
                    roughnessMap={asphaltRough ?? undefined}
                    roughness={isRural ? 0.9 : 0.6}
                    metalness={0.1}
                />
            </mesh>

            {/* Calçadas 3D (Com meio-fio) */}
            {!isRural && (
                <>
                    {/* Esquerda */}
                    <mesh
                        position={[-TRACK_WIDTH / 2 - 1.2, 0.1, -TRACK_LENGTH / 2 + 5]}
                        receiveShadow
                        castShadow
                    >
                        {/* BoxGeometry: Largura 2.4, Altura 0.2, Comprimento TRACK_LENGTH */}
                        {/* Y=0.1 coloca metade do cubo (0.1) acima do chão 0 */}
                        <boxGeometry args={[2.4, 0.2, TRACK_LENGTH]} />
                        <meshStandardMaterial
                            map={groundDiff ?? undefined}
                            color="#cccccc"
                            roughness={0.8}
                        />
                    </mesh>

                    {/* Direita */}
                    <mesh
                        position={[TRACK_WIDTH / 2 + 1.2, 0.1, -TRACK_LENGTH / 2 + 5]}
                        receiveShadow
                        castShadow
                    >
                        <boxGeometry args={[2.4, 0.2, TRACK_LENGTH]} />
                        <meshStandardMaterial
                            map={groundDiff ?? undefined}
                            color="#cccccc"
                            roughness={0.8}
                        />
                    </mesh>
                </>
            )}

            {/* Chão Infinito Texturizado */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial
                    map={groundDiff ?? undefined}
                    color={!groundDiff ? biome.fogColor : undefined}
                    roughness={1}
                />
            </mesh>
        </group>
    );
}
