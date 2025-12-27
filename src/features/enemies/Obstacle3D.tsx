import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DamageCategory, ObstacleType } from "./obstacle.types";
import { useTextureLoader, PROPS } from "../environment/TextureLibrary";

interface Obstacle3DProps {
    readonly type: ObstacleType;
    readonly category: DamageCategory;
    readonly scale?: number;
}

export function Obstacle3D({
    type,
    category,
    scale = 1,
}: Obstacle3DProps): React.JSX.Element {
    const meshRef = useRef<THREE.Mesh>(null);
    const isCoin = category === DamageCategory.COLLECTIBLE;

    // Carrega texturas
    // Moedas mantemos como geometria simples por enquanto (ouro)
    const barrelTex = useTextureLoader(PROPS.BARREL) as THREE.Texture | null;
    const trashTex = useTextureLoader(PROPS.TRASH_CAN) as THREE.Texture | null;
    const tvTex = useTextureLoader(PROPS.TV) as THREE.Texture | null;
    const barrierTex = useTextureLoader(PROPS.BARRIER) as THREE.Texture | null;

    // Seleciona geometria e textura baseado no tipo
    let geometry: THREE.BufferGeometry;
    let material: React.JSX.Element;

    // Lógica de seleção visual
    if (isCoin) {
        geometry = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
        material = (
            <meshStandardMaterial
                color="#ffd700"
                emissive="#ffb000"
                emissiveIntensity={0.6}
                metalness={0.9}
                roughness={0.1}
            />
        );
    } else if (category === DamageCategory.FINANCIAL) {
        // Imposto -> TV antiga passando jornal?
        geometry = new THREE.BoxGeometry(0.8, 0.6, 0.6);
        material = (
            <meshStandardMaterial
                map={tvTex}
                color={!tvTex ? "#ef4444" : undefined}
            />
        );
    } else if (category === DamageCategory.LETHAL) {
        // Letal -> Barril explosivo ou Lixeira
        // Alternar visual baseada na posição ou id seria melhor, mas aqui simplificamos
        const isBarrel = Math.random() > 0.5; // (Nota: isso vai flickerar se re-renderizar, ideal seria passar prop de seed)
        // Para estabilidade visual, vamos usar Barril para tudo por enquanto ou fixar baseada na posição lane (que não temos aqui)

        geometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
        material = (
            <meshStandardMaterial
                map={barrelTex}
                color={!barrelTex ? "#dc2626" : undefined}
            />
        );
    } else {
        // Default / Genérico
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        material = <meshStandardMaterial color="gray" />;
    }

    // Animação
    useFrame((state: { clock: { elapsedTime: number } }) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;

        // Rotação para moedas
        if (isCoin) {
            meshRef.current.rotation.y = time * 3;
            meshRef.current.rotation.x = Math.PI / 2; // Mantém em pé
        } else {
            meshRef.current.rotation.x = 0;
        }

        // Pulsação para financeiros
        if (category === DamageCategory.FINANCIAL) {
            const pulse = 1 + Math.sin(time * 5) * 0.08;
            meshRef.current.scale.setScalar(pulse * scale);
        }
    });

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            rotation={[0, 0, 0]}
            scale={scale}
            castShadow
            receiveShadow
        >
            {material}
        </mesh>
    );
}
