import { useGLTF } from '@react-three/drei';
import { Asset } from 'expo-asset';

const ASSETS = [
    require('../../../assets/models/barrier.glb'),
    require('../../../assets/models/trashcan.glb'),
    require('../../../assets/models/building.glb'),
    require('../../../assets/models/manhole.glb'),
    require('../../../assets/models/concrete_barrier.glb'),
    require('../../../assets/models/box.glb'),
    require('../../../assets/models/car.glb'),
    require('../../../assets/models/rat.glb'),
    require('../../../assets/models/utility_box.glb'),
    require('../../../assets/models/chair.glb'),
    require('../../../assets/models/streetlamp.glb'),
    require('../../../assets/models/camera.glb'),
];

export function AssetPreloader() {
    ASSETS.forEach(asset => {
        // Ensure we get the local URI for the bundled asset
        const uri = Asset.fromModule(asset).uri;
        if (uri) {
            useGLTF.preload(uri);
        }
    });
    return null;
}
