/**
 * @fileoverview Game Screen - Cena 3D completa com gameplay
 * Inclui: Canvas, Player, Track, Obstacles, GameLoop, HUD
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, Animated } from "react-native";
import { Canvas } from "@react-three/fiber";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGameStore, usePlayerStore, useObstacleStore, GameState } from "../src/stores";
import { GameOverModal, PauseModal } from "../src/features/ui";
import { GameLoop } from "../src/features/game/GameLoop";
import { PlayerSprite } from "../src/features/player/PlayerSprite";
import { Scenery } from "../src/features/environment/Scenery";
import { Track } from "../src/features/track/Track";
import { Obstacles } from "../src/features/enemies/Obstacles";
import { useGameAudio } from "../src/features/audio/useGameAudio";
import { useBiome } from "../src/features/game/useBiome";

// ============================================
// Constants
// ============================================

const COLORS = {
    primary: "#f48c25",
    backgroundDark: "#221910",
    trackGray: "#2d3436",
    white: "#ffffff",
    red: "#ef4444",
    green: "#22c55e",
} as const;

const SWIPE_THRESHOLD = 50;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================
// Componente Principal
// ============================================

export default function GameScreen(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const [showDamageFlash, setShowDamageFlash] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const flashOpacity = useRef(new Animated.Value(0)).current;

    // Hooks Customizados
    const { playMusic } = useGameAudio();
    const currentBiome = useBiome();

    // Store state
    const startGame = useGameStore((state) => state.startGame);
    const gameState = useGameStore((state) => state.gameState);
    const currentMoney = useGameStore((state) => state.currentMoney);
    const score = useGameStore((state) => state.score);
    const resetObstacles = useObstacleStore((state) => state.resetObstacles);

    // Player Actions
    const moveLeft = usePlayerStore((state) => state.moveLeft);
    const moveRight = usePlayerStore((state) => state.moveRight);
    const jump = usePlayerStore((state) => state.jump);

    const isGameOver = gameState === GameState.GAME_OVER;

    // Efeito de Música Dinâmica
    useEffect(() => {
        if (currentBiome?.musicTrack) {
            playMusic(currentBiome.musicTrack);
        }
    }, [currentBiome.id, playMusic, currentBiome?.musicTrack]);

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
                useNativeDriver: true, // Web support checked implicitly, native driver safe for opacity
            }),
            Animated.timing(flashOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setShowDamageFlash(false));
    }, [flashOpacity]);

    const handleCoinCollected = useCallback(() => {
        // Poderia adicionar efeito visual de coleta aqui na UI 2D se quiser
    }, []);

    // Gesture handler (Swipe)
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
                    <color attach="background" args={[currentBiome.fogColor]} />

                    {/* Luzes */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                    <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

                    {/* Cena */}
                    <Track />
                    <Scenery />
                    <PlayerSprite />
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
                <View style={[styles.hudTop, { top: insets.top + 10 }]}>
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

                {/* Botão Pausar */}
                <View style={[styles.pauseButton, { top: insets.top + 60 }]}>
                    <Pressable
                        style={styles.pauseButtonInner}
                        onPress={() => setIsPaused(true)}
                    >
                        <Text style={styles.pauseButtonText}>⏸️</Text>
                    </Pressable>
                </View>

                {/* Modal de Pausa */}
                <PauseModal
                    visible={isPaused && !isGameOver}
                    onResume={() => setIsPaused(false)}
                />

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
        zIndex: 10,
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
    pauseButton: {
        position: "absolute",
        right: 20,
        zIndex: 10,
    },
    pauseButtonInner: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    pauseButtonText: {
        fontSize: 22,
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
