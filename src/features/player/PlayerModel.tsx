/**
 * @fileoverview PlayerModel - Modelo 3D GLB do jogador
 * Carrega e renderiza o modelo GLB com animações básicas
 */

import { useRef, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePlayerStore, useGameStore, GameState } from "../../stores";
import { Asset } from "expo-asset";

// Configurações de movimento
const LANE_WIDTH = 2.5;
const MOVE_SPEED = 15;
const LEAN_ANGLE = 0.15;
const BOB_SPEED = 8;
const BOB_AMOUNT = 0.08;

// Path para o modelo (será resolvido em runtime)
// @ts-ignore
const MODEL_PATH = require("../../../assets/models/player.glb");

interface GLTFResult {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
}

/** Componente interno que renderiza o modelo */
function PlayerModelInner(): React.JSX.Element {
    const groupRef = useRef<THREE.Group>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);

    // State
    const currentLane = usePlayerStore((state) => state.currentLane);
    const gameState = useGameStore((state) => state.gameState);

    // Carrega o modelo GLB
    const gltf = useGLTF(MODEL_PATH as unknown as string) as unknown as GLTFResult;

    // Configura animações se existirem
    useEffect(() => {
        if (gltf.animations.length > 0 && gltf.scene) {
            mixerRef.current = new THREE.AnimationMixer(gltf.scene);
            const action = mixerRef.current.clipAction(gltf.animations[0]);
            action.play();
        }

        return () => {
            mixerRef.current?.stopAllAction();
        };
    }, [gltf]);

    // Animação frame a frame
    useFrame((state: { clock: { elapsedTime: number } }, delta: number) => {
        if (!groupRef.current) return;

        const isRunning = gameState === GameState.RUNNING;
        const targetX = (currentLane - 1) * LANE_WIDTH; // -1 para centralizar (LEFT=0, CENTER=1, RIGHT=2)
        const currentX = groupRef.current.position.x;

        // Movimento horizontal suave
        groupRef.current.position.x = THREE.MathUtils.lerp(
            currentX,
            targetX,
            MOVE_SPEED * delta
        );

        // Inclinação durante movimento
        const movingRight = targetX > currentX + 0.1;
        const movingLeft = targetX < currentX - 0.1;
        const targetLean = movingRight ? -LEAN_ANGLE : movingLeft ? LEAN_ANGLE : 0;
        groupRef.current.rotation.z = THREE.MathUtils.lerp(
            groupRef.current.rotation.z,
            targetLean,
            5 * delta
        );

        // Balanço vertical (corrida)
        if (isRunning) {
            const bob = Math.sin(state.clock.elapsedTime * BOB_SPEED) * BOB_AMOUNT;
            groupRef.current.position.y = 0 + bob;
        }

        // Atualiza mixer de animação
        if (mixerRef.current) {
            mixerRef.current.update(delta);
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 3]}>
            {/* Modelo GLB */}
            <primitive
                object={gltf.scene.clone()}
                scale={[1, 1, 1]}
                rotation={[0, Math.PI, 0]} // Virado para frente
            />

            {/* Sombra removida em favor de sombras reais 3D */}
        </group>
    );
}

/** Componente principal com Suspense fallback */
export function PlayerModel(): React.JSX.Element {
    return (
        <Suspense fallback={<PlayerFallback />}>
            <PlayerModelInner />
        </Suspense>
    );
}

/** Fallback enquanto carrega o modelo */
function PlayerFallback(): React.JSX.Element {
    return (
        <mesh position={[0, 0.5, 3]}>
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshStandardMaterial color="#f48c25" />
        </mesh>
    );
}
