import { useGLTF } from "@react-three/drei";
import { Scene, Object3D, Material } from "three";
import { GLTF } from "three-stdlib";

// Tipo estrito para o resultado do GLTF
export type GLTFResult = GLTF & {
    nodes: Record<string, Object3D>;
    materials: Record<string, Material>;
    scene: Scene;
};

// Singleton para pré-carregamento (opcional, o useGLTF já faz cache)
export const preloadGLB = (path: string) => useGLTF.preload(path);

/**
 * Hook tipado para carregar modelos GLB.
 * Garante que o path seja string e retorna tipos seguros.
 */
export function useGLBModel(path: string): GLTFResult {
    // Cast para string pois useGLTF espera string, mas nosso sistema de assets pode variar
    const gltf = useGLTF(path as string) as unknown as GLTFResult;

    // Fail-fast se não houver scene
    if (!gltf.scene) {
        throw new Error(`Failed to load GLB model from path: ${path}`);
    }

    return gltf;
}
