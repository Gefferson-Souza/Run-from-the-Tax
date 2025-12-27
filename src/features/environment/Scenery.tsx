/**
 * @fileoverview Scenery Component - Cenário lateral dinâmico melhorado
 * Usa geração procedural de prédios com detalhes arquitetônicos
 */

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBiome } from "../game/useBiome";
import { GameTheme } from "../game/biome.types";
import { CityScenery } from "./BuildingGenerator";

export function Scenery(): React.JSX.Element {
    const biome = useBiome();

    return (
        <group>
            {/* Prédios/Cenário baseado no bioma */}
            <CityScenery biomeId={biome.id} />
        </group>
    );
}
