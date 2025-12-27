import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InstancedMesh, Object3D } from "three";
import { Asset } from 'expo-asset';
import { useObstacleStore } from "../../../stores";
import { DamageCategory, OBSTACLE_CONSTANTS, ObstacleType, getCategory, LethalType, FinancialType, CollectibleType } from "../../enemies/obstacle.types";
import { useGLBModel } from "../loader/useGLBModel";

// Helper to resolve asset path
const resolve = (mod: number) => {
    const asset = Asset.fromModule(mod);
    return asset.uri || asset.localUri || '';
};

// Configuração dos Assets (Caminhos Resolvidos)
// Fixed paths: ../../../../assets/models/ (4 levels up to project root)
const ASSETS_MAP = {
    TRASH_CAN: require('../../../../assets/models/trashcan.glb'),
    BARRIER: require('../../../../assets/models/concrete_barrier.glb'),
    MANHOLE: require('../../../../assets/models/manhole.glb'),
    CAR: require('../../../../assets/models/car.glb'),
    RAT: require('../../../../assets/models/rat.glb'),
    BOX: require('../../../../assets/models/box.glb'),
    POLE: require('../../../../assets/models/streetlamp.glb'),
    CHAIR: require('../../../../assets/models/chair.glb'),
    CAMERA: require('../../../../assets/models/camera.glb'),
    GENERIC_BARRIER: require('../../../../assets/models/barrier.glb'),
};

const MAX_INSTANCES = 50;

export function InstancedObstacles(): React.JSX.Element {
    // Refs
    const refs = {
        [LethalType.MOTO]: useRef<InstancedMesh>(null),
        [LethalType.MAREA]: useRef<InstancedMesh>(null),
        [LethalType.PITBULL]: useRef<InstancedMesh>(null),
        [LethalType.BUEIRO]: useRef<InstancedMesh>(null),
        [LethalType.CEROL]: useRef<InstancedMesh>(null),

        [FinancialType.LEAO]: useRef<InstancedMesh>(null),
        [FinancialType.PIX]: useRef<InstancedMesh>(null),
        [FinancialType.PEDAGIO]: useRef<InstancedMesh>(null),
        [FinancialType.BLUSINHAS]: useRef<InstancedMesh>(null),
        [FinancialType.IPVA]: useRef<InstancedMesh>(null),
        [FinancialType.BOLETO]: useRef<InstancedMesh>(null),

        // Collectible Container
        [CollectibleType.MOEDA]: useRef<InstancedMesh>(null),
    };

    // Load Models
    const trashGLB = useGLBModel(resolve(ASSETS_MAP.TRASH_CAN));
    const barrierGLB = useGLBModel(resolve(ASSETS_MAP.BARRIER));
    const manholeGLB = useGLBModel(resolve(ASSETS_MAP.MANHOLE));
    const carGLB = useGLBModel(resolve(ASSETS_MAP.CAR));
    const ratGLB = useGLBModel(resolve(ASSETS_MAP.RAT));
    const boxGLB = useGLBModel(resolve(ASSETS_MAP.BOX));
    const poleGLB = useGLBModel(resolve(ASSETS_MAP.POLE));
    const chairGLB = useGLBModel(resolve(ASSETS_MAP.CHAIR));
    const cameraGLB = useGLBModel(resolve(ASSETS_MAP.CAMERA));
    const genericBarrierGLB = useGLBModel(resolve(ASSETS_MAP.GENERIC_BARRIER));

    const getGeoMat = (gltf: any) => {
        const nodes = gltf.nodes || {};
        const firstMesh = Object.values(nodes).find((n: any) => n.isMesh) as THREE.Mesh;
        return {
            geometry: firstMesh?.geometry || new THREE.BoxGeometry(),
            material: firstMesh?.material || new THREE.MeshBasicMaterial({ color: 'red' })
        };
    };

    const assets = useMemo(() => ({
        trash: getGeoMat(trashGLB),
        barrier: getGeoMat(barrierGLB),
        manhole: getGeoMat(manholeGLB),
        car: getGeoMat(carGLB),
        rat: getGeoMat(ratGLB),
        box: getGeoMat(boxGLB),
        pole: getGeoMat(poleGLB),
        chair: getGeoMat(chairGLB),
        camera: getGeoMat(cameraGLB),
        generic: getGeoMat(genericBarrierGLB)
    }), [trashGLB, barrierGLB, manholeGLB, carGLB, ratGLB, boxGLB, poleGLB, chairGLB, cameraGLB, genericBarrierGLB]);


    const tempObject = useMemo(() => new Object3D(), []);

    useFrame((state) => {
        const obstacles = useObstacleStore.getState().obstacles;
        const time = state.clock.elapsedTime;

        let carCount = 0, ratCount = 0, manholeCount = 0, poleCount = 0;
        let barrierCount = 0, boxCount = 0, trashCount = 0, cameraCount = 0, chairCount = 0;
        let collectibleCount = 0;

        obstacles.forEach((obs) => {
            if (obs.isCollected) return;

            const category = getCategory(obs.type);
            const x = OBSTACLE_CONSTANTS.LANE_X_POSITIONS[obs.lane];
            const z = obs.zPosition;
            let y = 0;

            tempObject.rotation.set(0, 0, 0);
            tempObject.scale.set(1, 1, 1);

            let matrixTarget: InstancedMesh | null = null;
            let index = 0;

            if (category === DamageCategory.COLLECTIBLE) {
                // All collectibles use the Box/Coin mesh for now
                matrixTarget = refs[CollectibleType.MOEDA].current;
                index = collectibleCount++;
                y = 1.0 + Math.sin(time * 3 + z) * 0.2; // Floating with phase offset
                tempObject.rotation.y = time * 2;
                tempObject.scale.set(0.4, 0.4, 0.4);
            } else {
                switch (obs.type) {
                    case LethalType.MOTO:
                    case LethalType.MAREA:
                        matrixTarget = refs[LethalType.MOTO].current; // Car
                        index = carCount++;
                        y = 0.5;
                        tempObject.rotation.y = Math.PI; // Face player
                        break;
                    case LethalType.PITBULL:
                        matrixTarget = refs[LethalType.PITBULL].current; // Rat
                        index = ratCount++;
                        y = 0.2;
                        tempObject.position.y += Math.abs(Math.sin(time * 15)) * 0.1; // Scurry hop
                        break;
                    case LethalType.BUEIRO:
                        matrixTarget = refs[LethalType.BUEIRO].current; // Manhole
                        index = manholeCount++;
                        y = 0.05;
                        break;
                    case LethalType.CEROL:
                        matrixTarget = refs[LethalType.CEROL].current; // Pole
                        index = poleCount++;
                        y = 0;
                        break;

                    case FinancialType.PEDAGIO:
                        matrixTarget = refs[FinancialType.PEDAGIO].current; // Concrete Barrier
                        index = barrierCount++;
                        y = 0;
                        break;
                    case FinancialType.BLUSINHAS:
                        matrixTarget = refs[FinancialType.BLUSINHAS].current; // Box
                        index = boxCount++;
                        y = 0.5;
                        break;
                    case FinancialType.LEAO:
                        matrixTarget = refs[FinancialType.LEAO].current; // Camera/Lion
                        index = cameraCount++;
                        y = 2; // Hanging?
                        break;

                    default:
                        if (obs.type === FinancialType.PIX || obs.type === FinancialType.BOLETO) {
                            matrixTarget = refs[FinancialType.PIX].current; // Chair
                            index = chairCount++;
                            y = 0.5;
                        } else {
                            matrixTarget = refs[FinancialType.IPVA].current; // Trashcan
                            index = trashCount++;
                            y = 0.5;
                        }
                        break;
                }
            }

            if (matrixTarget) {
                tempObject.position.set(x, y, z);
                tempObject.updateMatrix();
                matrixTarget.setMatrixAt(index, tempObject.matrix);
            }
        });

        // Update counts
        if (refs[LethalType.MOTO].current) { refs[LethalType.MOTO].current.count = carCount; refs[LethalType.MOTO].current.instanceMatrix.needsUpdate = true; }
        if (refs[LethalType.PITBULL].current) { refs[LethalType.PITBULL].current.count = ratCount; refs[LethalType.PITBULL].current.instanceMatrix.needsUpdate = true; }
        if (refs[LethalType.BUEIRO].current) { refs[LethalType.BUEIRO].current.count = manholeCount; refs[LethalType.BUEIRO].current.instanceMatrix.needsUpdate = true; }
        if (refs[LethalType.CEROL].current) { refs[LethalType.CEROL].current.count = poleCount; refs[LethalType.CEROL].current.instanceMatrix.needsUpdate = true; }

        if (refs[FinancialType.PEDAGIO].current) { refs[FinancialType.PEDAGIO].current.count = barrierCount; refs[FinancialType.PEDAGIO].current.instanceMatrix.needsUpdate = true; }
        if (refs[FinancialType.BLUSINHAS].current) { refs[FinancialType.BLUSINHAS].current.count = boxCount; refs[FinancialType.BLUSINHAS].current.instanceMatrix.needsUpdate = true; }
        if (refs[FinancialType.LEAO].current) { refs[FinancialType.LEAO].current.count = cameraCount; refs[FinancialType.LEAO].current.instanceMatrix.needsUpdate = true; }
        if (refs[FinancialType.PIX].current) { refs[FinancialType.PIX].current.count = chairCount; refs[FinancialType.PIX].current.instanceMatrix.needsUpdate = true; }
        if (refs[FinancialType.IPVA].current) { refs[FinancialType.IPVA].current.count = trashCount; refs[FinancialType.IPVA].current.instanceMatrix.needsUpdate = true; }

        if (refs[CollectibleType.MOEDA].current) { refs[CollectibleType.MOEDA].current.count = collectibleCount; refs[CollectibleType.MOEDA].current.instanceMatrix.needsUpdate = true; }
    });

    return (
        <group>
            {/* CARS */}
            <instancedMesh ref={refs[LethalType.MOTO]} args={[assets.car.geometry, assets.car.material, MAX_INSTANCES]} castShadow receiveShadow />
            {/* RATS */}
            <instancedMesh ref={refs[LethalType.PITBULL]} args={[assets.rat.geometry, assets.rat.material, MAX_INSTANCES]} castShadow receiveShadow />
            {/* MANHOLES */}
            <instancedMesh ref={refs[LethalType.BUEIRO]} args={[assets.manhole.geometry, assets.manhole.material, MAX_INSTANCES]} receiveShadow />
            {/* POLES */}
            <instancedMesh ref={refs[LethalType.CEROL]} args={[assets.pole.geometry, assets.pole.material, MAX_INSTANCES]} castShadow receiveShadow />
            {/* BARRIERS */}
            <instancedMesh ref={refs[FinancialType.PEDAGIO]} args={[assets.barrier.geometry, assets.barrier.material, MAX_INSTANCES]} castShadow receiveShadow />
            {/* BOXES */}
            <instancedMesh ref={refs[FinancialType.BLUSINHAS]} args={[assets.box.geometry, assets.box.material, MAX_INSTANCES]} castShadow receiveShadow />
            {/* CAMERAS */}
            <instancedMesh ref={refs[FinancialType.LEAO]} args={[assets.camera.geometry, assets.camera.material, MAX_INSTANCES]} castShadow receiveShadow />
            {/* CHAIRS */}
            <instancedMesh ref={refs[FinancialType.PIX]} args={[assets.chair.geometry, assets.chair.material, MAX_INSTANCES]} castShadow receiveShadow />
            {/* TRASH */}
            <instancedMesh ref={refs[FinancialType.IPVA]} args={[assets.trash.geometry, assets.trash.material, MAX_INSTANCES]} castShadow receiveShadow />
            {/* COLLECTIBLES */}
            <instancedMesh ref={refs[CollectibleType.MOEDA]} args={[assets.box.geometry, assets.box.material, MAX_INSTANCES]} castShadow receiveShadow />
        </group>
    );
}
