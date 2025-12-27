/**
 * @fileoverview PlayerSprite - Animação Frame-by-Frame
 * Carrega 6 imagens separadas e alterna entre elas para criar animação fluida
 */

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Asset } from "expo-asset";
import { usePlayerStore, Lane } from "../../stores";

// 6 frames de animação
/* eslint-disable @typescript-eslint/no-var-requires */
const FRAME_ASSETS = [
    require("../../../assets/frames/frame1.png"),
    require("../../../assets/frames/frame2.png"),
    require("../../../assets/frames/frame3.png"),
    require("../../../assets/frames/frame4.png"),
    require("../../../assets/frames/frame5.png"),
    require("../../../assets/frames/frame6.png"),
    require("../../../assets/frames/frame7.png"),
    require("../../../assets/frames/frame8.png"),
];
/* eslint-enable @typescript-eslint/no-var-requires */

/** Configuração da animação */
const ANIM_CONFIG = {
    /** Frames por segundo - Aumentado para maior fluidez */
    FPS: 15,
    /** Total de frames */
    TOTAL_FRAMES: 8,
} as const;

/** Posições das pistas */
const LANE_X: Readonly<Record<Lane, number>> = {
    [Lane.LEFT]: -2,
    [Lane.CENTER]: 0,
    [Lane.RIGHT]: 2,
};

/** Outras configurações */
const CONFIG = {
    SCALE: 2.0,
    BASE_Y: 1.0,
    LERP: 12,
    LEAN_MAX: 0.2,
    LEAN_DECAY: 5,
    SHADOW_OPACITY: 0.35,
};

export function PlayerSprite(): React.JSX.Element {
    const spriteRef = useRef<THREE.Sprite>(null);
    const shadowRef = useRef<THREE.Mesh>(null);

    // Array de texturas carregadas
    const [textures, setTextures] = useState<THREE.Texture[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Carrega todas as 6 texturas
    useEffect(() => {
        async function loadAllFrames(): Promise<void> {
            try {
                const loadedTextures: THREE.Texture[] = [];
                const loader = new THREE.TextureLoader();

                for (const frameAsset of FRAME_ASSETS) {
                    const asset = Asset.fromModule(frameAsset);
                    await asset.downloadAsync();

                    if (asset.localUri) {
                        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
                            loader.load(
                                asset.localUri as string,
                                (tex) => {
                                    tex.colorSpace = THREE.SRGBColorSpace;
                                    resolve(tex);
                                },
                                undefined,
                                reject
                            );
                        });
                        loadedTextures.push(texture);
                    }
                }

                if (loadedTextures.length === ANIM_CONFIG.TOTAL_FRAMES) {
                    setTextures(loadedTextures);
                    setIsLoaded(true);
                    console.log(`✅ ${loadedTextures.length} frames de animação carregados!`);
                }
            } catch (error) {
                console.error("❌ Erro ao carregar frames:", error);
            }
        }

        loadAllFrames();
    }, []);

    const currentLane = usePlayerStore((s) => s.currentLane);

    // Estado de animação
    const state = useRef({
        x: 0,
        lean: 0,
        prevLane: currentLane,
        frameTime: 0,
        currentFrame: 0,
    });

    useFrame((_, delta) => {
        if (!spriteRef.current || !isLoaded) return;
        const s = state.current;

        // ========================================
        // ANIMAÇÃO DE FRAMES
        // ========================================
        s.frameTime += delta;
        const frameDuration = 1 / ANIM_CONFIG.FPS;

        if (s.frameTime >= frameDuration) {
            s.frameTime -= frameDuration;
            s.currentFrame = (s.currentFrame + 1) % ANIM_CONFIG.TOTAL_FRAMES;

            // Troca a textura do sprite
            if (textures[s.currentFrame]) {
                spriteRef.current.material.map = textures[s.currentFrame];
                spriteRef.current.material.needsUpdate = true;
            }
        }

        // ========================================
        // MOVIMENTO HORIZONTAL
        // ========================================
        const targetX = LANE_X[currentLane];
        s.x += (targetX - s.x) * CONFIG.LERP * delta;

        // ========================================
        // LEAN (inclinação)
        // ========================================
        if (currentLane !== s.prevLane) {
            s.lean = currentLane > s.prevLane ? -CONFIG.LEAN_MAX : CONFIG.LEAN_MAX;
            s.prevLane = currentLane;
        }
        s.lean *= 1 - CONFIG.LEAN_DECAY * delta;

        // ========================================
        // APLICAR TRANSFORMAÇÕES
        // ========================================
        spriteRef.current.position.set(s.x, CONFIG.BASE_Y, 0);
        spriteRef.current.material.rotation = s.lean;
        spriteRef.current.scale.set(CONFIG.SCALE, CONFIG.SCALE, 1);

        // ========================================
        // SOMBRA
        // ========================================
        if (shadowRef.current) {
            shadowRef.current.position.set(s.x, 0.01, 0.5);
            shadowRef.current.scale.set(1.2, 0.4, 1);
        }
    });

    // Loading state fallback (Animated)
    if (!isLoaded || textures.length === 0) {
        return (
            <mesh ref={spriteRef as any} position={[0, CONFIG.BASE_Y, 0]}>
                <boxGeometry args={[0.8, 1.2, 0.4]} />
                <meshStandardMaterial color="#f48c25" />
            </mesh>
        );
    }

    return (
        <group>
            {/* Sombra */}
            <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.5]}>
                <circleGeometry args={[1, 32]} />
                <meshBasicMaterial color="#000" transparent opacity={CONFIG.SHADOW_OPACITY} />
            </mesh>

            {/* Sprite animado */}
            <sprite ref={spriteRef} position={[0, CONFIG.BASE_Y, 0]}>
                <spriteMaterial map={textures[0]} transparent alphaTest={0.1} />
            </sprite>
        </group>
    );
}
