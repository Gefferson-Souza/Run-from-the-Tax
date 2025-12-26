/**
 * @fileoverview Player Component - Cubo 3D que representa o jogador
 * Usa interpolação suave (lerp) para movimento entre pistas
 * Performance: manipula ref.current.position diretamente no useFrame
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MathUtils } from "three";
import { usePlayerStore, Lane } from "../../stores";

/** Posições X para cada pista */
const LANE_POSITIONS: Readonly<Record<Lane, number>> = {
    [Lane.LEFT]: -2,
    [Lane.CENTER]: 0,
    [Lane.RIGHT]: 2,
} as const;

/** Velocidade de interpolação (0-1, maior = mais rápido) */
const LERP_SPEED = 0.15;

/** Altura do pulo */
const JUMP_HEIGHT = 2;

/** Velocidade do pulo (gravidade simulada) */
const JUMP_SPEED = 0.12;

interface PlayerProps {
    /** Cor do cubo (temporário até termos modelo 3D) */
    readonly color?: string;
}

export function Player({ color = "#22c55e" }: PlayerProps): React.JSX.Element {
    const meshRef = useRef<Mesh>(null);
    const jumpProgressRef = useRef<number>(0);

    // Seleciona apenas o que precisa da store para evitar re-renders
    const currentLane = usePlayerStore((state) => state.currentLane);
    const isJumping = usePlayerStore((state) => state.isJumping);
    const land = usePlayerStore((state) => state.land);

    useFrame(() => {
        if (!meshRef.current) return;

        // Interpola posição X suavemente entre pistas
        const targetX = LANE_POSITIONS[currentLane];
        meshRef.current.position.x = MathUtils.lerp(
            meshRef.current.position.x,
            targetX,
            LERP_SPEED
        );

        // Lógica de pulo (arco parabólico)
        if (isJumping) {
            jumpProgressRef.current += JUMP_SPEED;

            // Calcula altura usando função senoidal para arco suave
            const jumpArc = Math.sin(jumpProgressRef.current * Math.PI);
            meshRef.current.position.y = 0.5 + jumpArc * JUMP_HEIGHT;

            // Aterrissou
            if (jumpProgressRef.current >= 1) {
                jumpProgressRef.current = 0;
                meshRef.current.position.y = 0.5;
                land();
            }
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.8, 1, 0.8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}
