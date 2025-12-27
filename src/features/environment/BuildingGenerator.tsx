import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, GameState } from "../../stores";
import { useTextureLoader, FACADES, WALLS } from "./TextureLibrary";

interface BuildingProps {
    readonly position: [number, number, number];
    readonly height: number;
    readonly width: number;
    readonly depth: number;
    readonly color: string;
    readonly style?: "modern" | "old" | "glass";
    readonly facadeTexture?: THREE.Texture;
}

/** Prédio individual com geometria composta (Base + Corpo + Telhado) */
export function Building({
    position,
    height,
    width,
    depth,
    color,
    style = "modern",
    facadeTexture,
}: BuildingProps): React.JSX.Element {
    const groupRef = useRef<THREE.Group>(null);

    // Se o prédio for muito baixo, renderiza como uma estrutura única (barraco/loja pequena)
    const isSmallBuilding = height < 6;
    const baseHeight = isSmallBuilding ? height : 4; // Térreo tem 4m de pé direito
    const bodyHeight = isSmallBuilding ? 0 : height - baseHeight;

    return (
        <group ref={groupRef} position={position}>
            {/* --- BASE / TÉRREO (Loja/Entrada) --- */}
            <mesh position={[0, baseHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, baseHeight, depth]} />
                <meshStandardMaterial
                    color={"#1a202c"} // Base escura (concreto/metal)
                    roughness={0.9}
                    metalness={0.2}
                />
            </mesh>

            {/* Detalhe: Toldo ou Marquise na base (apenas se não for rural) */}
            {style !== "old" && (
                <mesh position={[0, 3.5, depth / 2 + 0.5]} receiveShadow>
                    <boxGeometry args={[width + 0.2, 0.2, 1]} />
                    <meshStandardMaterial color="#2d3748" />
                </mesh>
            )}

            {/* --- CORPO DO PRÉDIO (Andares) --- */}
            {bodyHeight > 0 && (
                <group position={[0, baseHeight + bodyHeight / 2, 0]}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[width, bodyHeight, depth]} />
                        <meshStandardMaterial
                            color={color}
                            roughness={style === "glass" ? 0.2 : 0.8}
                            metalness={style === "glass" ? 0.8 : 0.1}
                        />
                    </mesh>

                    {/* Fachada Texturizada (Plane ligeiramente à frente) */}
                    {facadeTexture && (
                        <mesh position={[0, 0, depth / 2 + 0.05]} castShadow>
                            <planeGeometry args={[width, bodyHeight]} />
                            <meshStandardMaterial
                                map={facadeTexture}
                                transparent
                                roughness={0.8}
                            />
                        </mesh>
                    )}
                </group>
            )}

            {/* --- TELHADO / CORNIJA --- */}
            <mesh position={[0, height, 0]} receiveShadow>
                {/* Laje um pouco maior que o prédio para fazer a borda */}
                <boxGeometry args={[width + 0.4, 0.5, depth + 0.4]} />
                <meshStandardMaterial color="#2d3748" roughness={0.9} />
            </mesh>

            {/* Elements de topo (Caixa d'água / Ar condicionado) */}
            <group position={[0, height + 0.25, 0]}>
                {/* Caixa d'água aleatória */}
                <mesh position={[width / 4, 0.5, 0]}>
                    <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
                    <meshStandardMaterial color="#a0aec0" />
                </mesh>
            </group>
        </group>
    );
}

/** Configuração de prédios por bioma */
interface BiomeBuildingConfig {
    readonly colors: readonly string[];
    readonly heightRange: [number, number];
    readonly widthRange: [number, number];
    readonly style: "modern" | "old" | "glass";
    readonly spacing: number;
}

const BUILDING_CONFIGS: Record<string, BiomeBuildingConfig> = {
    RICH_CITY: {
        colors: ["#1a3a5c", "#2c5282", "#1e3a5f", "#0f2b46", "#2d3748"],
        heightRange: [15, 30],
        widthRange: [3, 5],
        style: "glass",
        spacing: 12,
    },
    FAVELA: {
        colors: ["#8b4513", "#a0522d", "#cd853f", "#d2691e", "#b8860b"],
        heightRange: [4, 10],
        widthRange: [3, 4],
        style: "old",
        spacing: 6,
    },
    RURAL: {
        colors: ["#228b22", "#2e8b57", "#006400"],
        heightRange: [4, 8],
        widthRange: [1, 2],
        style: "old",
        spacing: 8,
    },
};

interface CitySceneryProps {
    readonly biomeId: string;
}

/** Renderiza uma fileira de prédios baseado no bioma */
export function CityScenery({ biomeId }: CitySceneryProps): React.JSX.Element {
    const config = BUILDING_CONFIGS[biomeId] ?? BUILDING_CONFIGS.RICH_CITY;
    const groupRef = useRef<THREE.Group>(null);
    const speed = useGameStore((state) => state.speed);
    const gameState = useGameStore((state) => state.gameState);

    // Carrega texturas do bioma
    const facadeAssets = biomeId === "FAVELA" ? FACADES.FAVELA : FACADES.RICH_CITY;
    const textures = useTextureLoader(facadeAssets) as THREE.Texture[] | null;

    // Gera prédios iniciais
    const buildings = useMemo(() => {
        const result: Array<{
            id: number;
            x: number;
            z: number;
            height: number;
            width: number;
            color: string;
            textureIndex: number;
        }> = [];

        // Menos prédios para performance, mas maiores
        const count = 20;
        for (let i = 0; i < count; i++) {
            const isLeft = i % 2 === 0;
            const x = (isLeft ? -1 : 1) * (7 + Math.random() * 2);
            const z = -40 + i * config.spacing; // Começa mais perto
            const height = config.heightRange[0] + Math.random() * (config.heightRange[1] - config.heightRange[0]);
            const width = config.widthRange[0] + Math.random() * (config.widthRange[1] - config.widthRange[0]);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            const textureIndex = Math.floor(Math.random() * facadeAssets.length);

            result.push({ id: i, x, z, height, width, color, textureIndex });
        }

        return result;
    }, [config, biomeId, facadeAssets.length]);

    // Move os prédios (parallax)
    const positionsRef = useRef(buildings.map((b) => b.z));

    useFrame((_state: any, delta: number) => {
        if (!groupRef.current) return;
        if (gameState !== GameState.RUNNING) return;

        const moveDist = speed * delta * 25;
        const respawnZ = -config.spacing * 2; // Ponto de respawn mais distante
        const limitZ = 30;

        groupRef.current.children.forEach((child, i) => {
            positionsRef.current[i] += moveDist;

            // Reciclagem contínua
            if (positionsRef.current[i] > limitZ) {
                // Encontra o prédio mais distante para colocar atrás dele
                const minZ = Math.min(...positionsRef.current);
                positionsRef.current[i] = minZ - config.spacing;
            }

            child.position.z = positionsRef.current[i];
        });
    });

    return (
        <group ref={groupRef}>
            {buildings.map((b) => (
                <Building
                    key={b.id}
                    position={[b.x, 0, b.z]}
                    height={b.height}
                    width={b.width}
                    depth={4}
                    color={b.color}
                    style={config.style}
                    facadeTexture={textures ? textures[b.textureIndex] : undefined}
                />
            ))}
        </group>
    );
}
