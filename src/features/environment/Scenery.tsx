/**
 * @fileoverview Scenery Component - Cenário lateral dinâmico melhorado
 * Usa geração procedural de prédios com detalhes arquitetônicos
 */

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBiome } from "../game/useBiome";
import { GameTheme } from "../game/biome.types";
import { InstancedCity } from "./InstancedCity";
import { InstancedVegetation } from "./InstancedVegetation";

export function Scenery(): React.JSX.Element {
    const biome = useBiome();

    return (
        <group>
            {/* Prédios (Cidade Rica/Favela) */}
            <InstancedCity />

            {/* Vegetação (Estrada/Rural) - Adiciona vida extra no ambiente */}
            <InstancedVegetation />
        </group>
    );
}
