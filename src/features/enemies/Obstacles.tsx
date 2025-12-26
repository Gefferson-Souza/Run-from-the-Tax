/**
 * @fileoverview Obstacles Container - Renderiza todos os obstáculos ativos
 * Usa useObstacleStore para obter lista de obstáculos
 */

import { useObstacleStore } from "../../stores";
import { Obstacle } from "./Obstacle";

export function Obstacles(): React.JSX.Element {
    const obstacles = useObstacleStore((state) => state.obstacles);

    return (
        <group>
            {obstacles.map((obs) => (
                <Obstacle
                    key={obs.id}
                    type={obs.type}
                    lane={obs.lane}
                    zPosition={obs.zPosition}
                    isCollected={obs.isCollected}
                />
            ))}
        </group>
    );
}
