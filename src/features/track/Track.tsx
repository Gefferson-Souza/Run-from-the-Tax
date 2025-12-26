/**
 * @fileoverview Track Component - Pista infinita com ilusão de velocidade
 * Usa Object Pooling conceitual: a textura se move, não os objetos
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, RepeatWrapping, TextureLoader, MathUtils } from "three";
import { useGameStore } from "../../stores";

/** Largura da pista */
const TRACK_WIDTH = 8;

/** Comprimento visível da pista */
const TRACK_LENGTH = 50;

/** Velocidade base do scroll da textura */
const BASE_SCROLL_SPEED = 0.02;

export function Track(): React.JSX.Element {
    const planeRef = useRef<Mesh>(null);
    const textureOffsetRef = useRef<number>(0);

    const speed = useGameStore((state) => state.speed);

    // Cria textura procedural simples (linhas de asfalto)
    const texture = useMemo(() => {
        // Canvas para criar textura de asfalto
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            // Fundo asfalto cinza
            ctx.fillStyle = "#2d3436";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Linhas brancas laterais
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(20, 0, 4, canvas.height);
            ctx.fillRect(canvas.width - 24, 0, 4, canvas.height);

            // Linha pontilhada central
            ctx.fillStyle = "#f1c40f";
            for (let i = 0; i < canvas.height; i += 40) {
                ctx.fillRect(canvas.width / 2 - 2, i, 4, 20);
            }

            // Divisores de pista
            ctx.fillStyle = "#636e72";
            ctx.fillRect(canvas.width / 3 - 1, 0, 2, canvas.height);
            ctx.fillRect((canvas.width * 2) / 3 - 1, 0, 2, canvas.height);
        }

        const loader = new TextureLoader();
        const tex = loader.load(canvas.toDataURL());
        tex.wrapS = RepeatWrapping;
        tex.wrapT = RepeatWrapping;
        tex.repeat.set(1, 10);

        return tex;
    }, []);

    useFrame(() => {
        if (!texture) return;

        // Scroll da textura para simular movimento
        textureOffsetRef.current += BASE_SCROLL_SPEED * speed;
        texture.offset.y = textureOffsetRef.current;
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
                <meshStandardMaterial map={texture} />
            </mesh>

            {/* Chão escuro infinito para as laterais */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
        </group>
    );
}
