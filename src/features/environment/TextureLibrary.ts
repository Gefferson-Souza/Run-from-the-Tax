/**
 * @fileoverview TextureLibrary - Centraliza o carregamento de texturas do Poly Haven
 */

// Facades (Prédios)
export const FACADES: Record<string, number[]> = {
    RICH_CITY: [
        require("../../../assets/poly_haven/facades/Facade018A.png"),
        require("../../../assets/poly_haven/facades/Facade019A.png"),
        require("../../../assets/poly_haven/facades/Facade020A.png"),
    ],
    FAVELA: [
        require("../../../assets/poly_haven/facades/Facade001.png"),
        require("../../../assets/poly_haven/facades/Facade006.png"),
        require("../../../assets/poly_haven/walls/red_plaster.jpg"),
        require("../../../assets/poly_haven/walls/raw_plank.jpg"),
    ],
    WINDOWS: [
        require("../../../assets/poly_haven/facades/Facade018A.png"),
    ] as number[] // Changed structure to simple array for consistency
};

// Walls & Materials
export const WALLS: Record<string, number> = {
    BRICK: require("../../../assets/poly_haven/walls/brick_wall.jpg"),
    CONCRETE_CRACKED: require("../../../assets/poly_haven/walls/concrete_cracked.jpg"),
    PLASTER_GREY: require("../../../assets/poly_haven/walls/grey_plaster.jpg"),
};

// Ground / Environment
export const GROUND: Record<string, number> = {
    RURAL_DIRT: require("../../../assets/poly_haven/ground/dirt_floor.png"),
    RURAL_GRASS: require("../../../assets/poly_haven/ground/grass.jpg"),
    URBAN_CONCRETE: require("../../../assets/poly_haven/ground/urban_concrete.jpg"),
    ASPHALT_DIFF: require("../../../assets/textures/asphalt_02_diff_4k.jpg"),
    ASPHALT_ROUGH: require("../../../assets/textures/asphalt_02_rough_4k.jpg"),
};

// Obstacles / Props
export const PROPS: Record<string, number> = {
    BARREL: require("../../../assets/poly_haven/props/barrel.jpg"),
    TRASH_CAN: require("../../../assets/poly_haven/props/trash_can.jpg"),
    TV: require("../../../assets/poly_haven/props/tv.jpg"),
    CHAIR: require("../../../assets/poly_haven/props/chair.jpg"),
    BARRIER: require("../../../assets/poly_haven/props/barrier.jpg"),
};

// Helper type for texture keys
export type FacadeCategory = keyof typeof FACADES;

import { Asset } from "expo-asset";
import { TextureLoader, Texture, RepeatWrapping, SRGBColorSpace } from "three";
import { useState, useEffect } from "react";

export function useTextureLoader(resourceId: number | number[]): Texture | Texture[] | null {
    const [texture, setTexture] = useState<Texture | Texture[] | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const isArray = Array.isArray(resourceId);
                const resources = isArray ? resourceId : [resourceId];

                const textures: Texture[] = [];
                const loader = new TextureLoader();

                for (const res of resources) {
                    const asset = Asset.fromModule(res);
                    await asset.downloadAsync();

                    if (asset.localUri) {
                        const tex = loader.load(asset.localUri);
                        tex.colorSpace = SRGBColorSpace;
                        textures.push(tex);
                    }
                }

                if (isArray) {
                    setTexture(textures);
                } else {
                    setTexture(textures[0] || null);
                }
            } catch (e) {
                console.warn("Error loading textures:", e);
                setTexture(null);
            }
        }

        load();
    }, [JSON.stringify(resourceId)]);

    return texture;
}
