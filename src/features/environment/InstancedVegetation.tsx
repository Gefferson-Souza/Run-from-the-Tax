import React, { useRef, useMemo, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InstancedMesh, Object3D, Color } from "three";
import { useGameStore } from "../../stores";

const COUNT = 100; // Number of trees
const FAR_Z = 250; // Spawn distance
const DESPAWN_Z = -20;
const ROAD_WIDTH = 15; // Trees always spawn outside this width

export function InstancedVegetation(): React.JSX.Element {
    const trunkRef = useRef<InstancedMesh>(null);
    const leavesRef = useRef<InstancedMesh>(null);

    // 1. Procedural Geometries (No Assets needed!)
    const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.5, 0.7, 3, 6), []);
    const leavesGeo = useMemo(() => new THREE.ConeGeometry(3, 8, 8), []);

    const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5d4037" }), []);
    const leavesMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2d5a27" }), []);

    // 2. Initial State
    const instances = useMemo(() => {
        return new Array(COUNT).fill(0).map((_, i) => ({
            x: (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH + Math.random() * 30),
            z: (i / COUNT) * FAR_Z - 20, // Spread nicely
            scale: 0.8 + Math.random() * 0.8, // Random size
            rotation: Math.random() * Math.PI,
        }));
    }, []);

    const tempObject = useMemo(() => new Object3D(), []);

    // 3. Setup Loop
    useLayoutEffect(() => {
        if (!trunkRef.current || !leavesRef.current) return;

        instances.forEach((data, i) => {
            updateInstance(i, data, trunkRef.current!, leavesRef.current!, tempObject);
        });
        trunkRef.current.instanceMatrix.needsUpdate = true;
        leavesRef.current.instanceMatrix.needsUpdate = true;
    }, []);

    // 4. Update Helper
    const updateInstance = (index: number, data: any, trunkMesh: InstancedMesh, leavesMesh: InstancedMesh, dummy: Object3D) => {
        const { x, z, scale, rotation } = data;

        // Trunk
        dummy.position.set(x, 1.5 * scale, z);
        dummy.rotation.set(0, rotation, 0);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        trunkMesh.setMatrixAt(index, dummy.matrix);

        // Leaves (Just above trunk)
        dummy.position.set(x, (3 * scale) + (4 * scale) / 2, z); // shift up
        dummy.updateMatrix();
        leavesMesh.setMatrixAt(index, dummy.matrix);
    };

    // 5. Game Loop
    useFrame((state) => {
        if (!trunkRef.current || !leavesRef.current) return;

        const speed = useGameStore.getState().speed;
        const dist = speed * 0.3; // Sync with track

        instances.forEach((inst, i) => {
            inst.z -= dist;

            // Recycle
            if (inst.z < DESPAWN_Z) {
                inst.z = FAR_Z;
                inst.x = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH + Math.random() * 30);
                inst.scale = 0.8 + Math.random() * 0.8;
                updateInstance(i, inst, trunkRef.current!, leavesRef.current!, tempObject);
            } else {
                // Just update Z
                // Optimization: Only update matrix if visible? 
                // For now, update all for smooth movement
                updateInstance(i, inst, trunkRef.current!, leavesRef.current!, tempObject);
            }
        });

        trunkRef.current.instanceMatrix.needsUpdate = true;
        leavesRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, COUNT]} castShadow receiveShadow />
            <instancedMesh ref={leavesRef} args={[leavesGeo, leavesMat, COUNT]} castShadow receiveShadow />
        </group>
    );
}
