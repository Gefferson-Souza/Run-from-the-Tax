/**
 * @fileoverview Game Screen - Cena 3D completa com gameplay
 * Inclui: Canvas, Player, Track, Obstacles, GameLoop, HUD
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, Animated } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Link } from "expo-router";
import { Mesh, MathUtils } from "three";

import { useGameStore, usePlayerStore, useObstacleStore, Lane, GameState } from "../src/stores";
import { GameOverModal } from "../src/features/ui";
import { Obstacles, LanePosition, OBSTACLE_CONSTANTS, ObstacleType } from "../src/features/enemies";
import { GameLoop } from "../src/features/game";

/** Cores do jogo */
const COLORS = {
    primary: "#f48c25",
    backgroundDark: "#221910",
    trackGray: "#2d3436",
    white: "#ffffff",
    red: "#ef4444",
    green: "#22c55e",
} as const;

/** Posições X das pistas */
const LANE_POSITIONS: Readonly<Record<Lane, number>> = {
    [Lane.LEFT]: -2,
    [Lane.CENTER]: 0,
    [Lane.RIGHT]: 2,
} as const;

const SWIPE_THRESHOLD = 50;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================
// Componentes 3D
// ============================================

/** Constantes de animação do player */
const PLAYER_ANIM = {
    /** Velocidade do bounce (quicar) */
    BOUNCE_SPEED: 12,
    /** Altura do bounce */
    BOUNCE_HEIGHT: 0.08,
    /** Altura base do player */
    BASE_Y: 0.5,
    /** Velocidade de interpolação horizontal */
    LANE_LERP: 0.15,
    /** Inclinação máxima ao mudar de pista (rad) */
    MAX_LEAN: 0.15,
    /** Velocidade de interpolação da inclinação */
    LEAN_LERP: 0.1,
} as const;

function PlayerCube(): React.JSX.Element {
    const meshRef = useRef<Mesh>(null);
    const currentLane = usePlayerStore((state) => state.currentLane);
    const isJumping = usePlayerStore((state) => state.isJumping);
    const land = usePlayerStore((state) => state.land);
    const jumpProgressRef = useRef<number>(0);
    const prevLaneRef = useRef<Lane>(currentLane);
    const leanRef = useRef<number>(0);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        const t = clock.getElapsedTime();

        // Movimento horizontal suave
        const targetX = LANE_POSITIONS[currentLane];
        meshRef.current.position.x = MathUtils.lerp(
            meshRef.current.position.x,
            targetX,
            PLAYER_ANIM.LANE_LERP
        );

        // Detecta mudança de pista para inclinação
        if (currentLane !== prevLaneRef.current) {
            // Inclina na direção do movimento
            if (currentLane < prevLaneRef.current) {
                leanRef.current = PLAYER_ANIM.MAX_LEAN; // Indo para esquerda
            } else {
                leanRef.current = -PLAYER_ANIM.MAX_LEAN; // Indo para direita
            }
            prevLaneRef.current = currentLane;
        }

        // Interpola inclinação de volta para 0
        leanRef.current = MathUtils.lerp(leanRef.current, 0, PLAYER_ANIM.LEAN_LERP);
        meshRef.current.rotation.z = leanRef.current;

        // Lógica de pulo
        if (isJumping) {
            jumpProgressRef.current += 0.08;
            const jumpArc = Math.sin(jumpProgressRef.current * Math.PI);
            meshRef.current.position.y = PLAYER_ANIM.BASE_Y + jumpArc * 2;

            if (jumpProgressRef.current >= 1) {
                jumpProgressRef.current = 0;
                meshRef.current.position.y = PLAYER_ANIM.BASE_Y;
                land();
            }
        } else {
            // Bounce de corrida (quicar) - só quando não está pulando
            const bounce = Math.sin(t * PLAYER_ANIM.BOUNCE_SPEED) * PLAYER_ANIM.BOUNCE_HEIGHT;
            meshRef.current.position.y = PLAYER_ANIM.BASE_Y + Math.abs(bounce);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.8, 1, 0.8]} />
            <meshStandardMaterial color={COLORS.primary} />
        </mesh>
    );
}

function TrackFloor(): React.JSX.Element {
    const textureOffsetRef = useRef<number>(0);
    const speed = useGameStore((state) => state.speed);

    useFrame((_, delta) => {
        textureOffsetRef.current += speed * delta * 2;
    });

    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]} receiveShadow>
                <planeGeometry args={[8, 100]} />
                <meshStandardMaterial color={COLORS.trackGray} />
            </mesh>

            {/* Linhas laterais */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.7, 0.01, -25]}>
                <planeGeometry args={[0.1, 100]} />
                <meshStandardMaterial color={COLORS.white} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.7, 0.01, -25]}>
                <planeGeometry args={[0.1, 100]} />
                <meshStandardMaterial color={COLORS.white} />
            </mesh>

            {/* Chão infinito */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
        </group>
    );
}

// ============================================
// Componente Principal
// ============================================

export default function GameScreen(): React.JSX.Element {
    const [showDamageFlash, setShowDamageFlash] = useState(false);
    const flashOpacity = useRef(new Animated.Value(0)).current;

    // Store state
    const startGame = useGameStore((state) => state.startGame);
    const gameState = useGameStore((state) => state.gameState);
    const currentMoney = useGameStore((state) => state.currentMoney);
    const score = useGameStore((state) => state.score);
    const resetObstacles = useObstacleStore((state) => state.resetObstacles);

    const isGameOver = gameState === GameState.GAME_OVER;

    const moveLeft = usePlayerStore((state) => state.moveLeft);
    const moveRight = usePlayerStore((state) => state.moveRight);
    const jump = usePlayerStore((state) => state.jump);

    // Inicia o jogo
    useEffect(() => {
        resetObstacles();
        startGame();
    }, [startGame, resetObstacles]);

    // Flash vermelho quando toma dano
    const handleTaxCollision = useCallback(() => {
        setShowDamageFlash(true);
        Animated.sequence([
            Animated.timing(flashOpacity, {
                toValue: 0.5,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(flashOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setShowDamageFlash(false));
    }, [flashOpacity]);

    const handleCoinCollected = useCallback(() => {
        // Poderia adicionar efeito visual de coleta aqui
    }, []);

    // Gesture handler
    const panGesture = Gesture.Pan().onEnd((event) => {
        const { translationX, translationY } = event;
        if (Math.abs(translationX) > SWIPE_THRESHOLD) {
            if (translationX < 0) moveLeft();
            else moveRight();
        } else if (translationY < -SWIPE_THRESHOLD) {
            jump();
        }
    });

    // Controles de teclado (web)
    useEffect(() => {
        if (Platform.OS !== "web") return;

        const handleKeyDown = (e: KeyboardEvent): void => {
            switch (e.key) {
                case "ArrowLeft":
                case "a":
                    moveLeft();
                    break;
                case "ArrowRight":
                case "d":
                    moveRight();
                    break;
                case "ArrowUp":
                case "w":
                case " ":
                    jump();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [moveLeft, moveRight, jump]);

    return (
        <GestureDetector gesture={panGesture}>
            <View style={styles.container}>
                {/* Canvas 3D */}
                <Canvas
                    shadows
                    camera={{ position: [0, 3, 5], fov: 60 }}
                    style={styles.canvas}
                    gl={{ antialias: true }}
                >
                    <color attach="background" args={["#0a0a0a"]} />

                    {/* Luzes */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                    <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

                    {/* Cena */}
                    <TrackFloor />
                    <PlayerCube />
                    <Obstacles />

                    {/* Game Loop (lógica) */}
                    <GameLoop
                        onTaxCollision={handleTaxCollision}
                        onCoinCollected={handleCoinCollected}
                    />
                </Canvas>

                {/* Flash de dano */}
                {showDamageFlash && (
                    <Animated.View
                        style={[styles.damageFlash, { opacity: flashOpacity }]}
                        pointerEvents="none"
                    />
                )}

                {/* HUD - Dinheiro */}
                <View style={styles.hudTop}>
                    <View style={styles.moneyBadge}>
                        <Text style={styles.moneyIcon}>💰</Text>
                        <Text style={[styles.moneyText, currentMoney < 0 && styles.moneyNegative]}>
                            R$ {currentMoney.toLocaleString("pt-BR")}
                        </Text>
                    </View>
                    <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>🏃 {score}m</Text>
                    </View>
                </View>

                {/* Botão Voltar */}
                <View style={styles.backButton}>
                    <Link href="/" asChild>
                        <Pressable style={styles.backButtonInner}>
                            <Text style={styles.backButtonText}>⬅️</Text>
                        </Pressable>
                    </Link>
                </View>

                {/* Instruções (web) */}
                {Platform.OS === "web" && !isGameOver && (
                    <View style={styles.instructions} pointerEvents="none">
                        <Text style={styles.instructionsText}>
                            ← → para mover | ↑ ou SPACE para pular
                        </Text>
                    </View>
                )}

                {/* Game Over Modal */}
                {isGameOver && <GameOverModal />}
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    canvas: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    damageFlash: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.red,
    },
    hudTop: {
        position: "absolute",
        top: 50,
        left: 20,
        right: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    moneyBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    moneyIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    moneyText: {
        color: COLORS.green,
        fontWeight: "bold",
        fontSize: 18,
    },
    moneyNegative: {
        color: COLORS.red,
    },
    scoreBadge: {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    scoreText: {
        color: COLORS.white,
        fontWeight: "bold",
        fontSize: 18,
    },
    backButton: {
        position: "absolute",
        top: 100,
        left: 20,
    },
    backButtonInner: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonText: {
        fontSize: 24,
    },
    instructions: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    instructionsText: {
        color: "rgba(255, 255, 255, 0.5)",
        fontSize: 14,
    },
});
