/**
 * @fileoverview Game Screen - Cena principal do jogo com Canvas R3F
 * Contém: Canvas 3D, Player, Track, Controles de Swipe, HUD
 * 
 * Performance: useFrame para animações, refs para manipulação direta
 * Tipagem: interfaces Props, nenhum 'any'
 */

import { useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, Dimensions, Platform } from "react-native";
import { Canvas } from "@react-three/fiber";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Link } from "expo-router";

import { Player } from "../src/features/player";
import { Track } from "../src/features/track";
import { useGameStore, usePlayerStore } from "../src/stores";

/** Threshold mínimo para detectar swipe (pixels) */
const SWIPE_THRESHOLD = 50;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GameScreen(): React.JSX.Element {
    // Store actions - seleciona apenas o necessário
    const startGame = useGameStore((state) => state.startGame);
    const speed = useGameStore((state) => state.speed);

    const moveLeft = usePlayerStore((state) => state.moveLeft);
    const moveRight = usePlayerStore((state) => state.moveRight);
    const jump = usePlayerStore((state) => state.jump);

    // Inicia o jogo ao montar o componente
    useEffect(() => {
        startGame();
    }, [startGame]);

    // Gesture handler para swipes
    const panGesture = Gesture.Pan()
        .onEnd((event) => {
            const { translationX, translationY, velocityX, velocityY } = event;

            // Detecta swipe horizontal
            if (Math.abs(translationX) > SWIPE_THRESHOLD) {
                if (translationX < 0) {
                    moveLeft();
                } else {
                    moveRight();
                }
                return;
            }

            // Detecta swipe para cima (pulo)
            if (translationY < -SWIPE_THRESHOLD && Math.abs(velocityY) > Math.abs(velocityX)) {
                jump();
            }
        });

    // Fallback para web: controle por teclado
    useEffect(() => {
        if (Platform.OS !== "web") return;

        const handleKeyDown = (event: KeyboardEvent): void => {
            switch (event.key) {
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
            <View style={{ flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: "#000" }}>
                {/* Canvas 3D - dimensões explícitas para garantir renderização */}
                <View style={{ flex: 1, width: "100%", height: "100%" }}>
                    <Canvas
                        shadows
                        camera={{
                            position: [0, 5, 8],
                            fov: 60,
                            near: 0.1,
                            far: 1000,
                        }}
                        style={{ flex: 1, width: "100%", height: "100%" }}
                    >
                        {/* Iluminação */}
                        <ambientLight intensity={0.4} />
                        <directionalLight
                            position={[5, 10, 5]}
                            intensity={1}
                            castShadow
                            shadow-mapSize-width={1024}
                            shadow-mapSize-height={1024}
                        />

                        {/* Céu/Fundo */}
                        <color attach="background" args={["#0f0f0f"]} />

                        {/* Componentes do jogo */}
                        <Track />
                        <Player />
                    </Canvas>
                </View>

                {/* HUD Overlay */}
                <View style={{
                    position: "absolute",
                    top: 50,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                    pointerEvents: "none"
                }}>
                    <Text style={{
                        color: "#fff",
                        fontSize: 32,
                        fontWeight: "bold",
                        textShadowColor: "rgba(0, 0, 0, 0.8)",
                        textShadowOffset: { width: 2, height: 2 },
                        textShadowRadius: 4,
                    }}>
                        🏃 0m
                    </Text>
                </View>

                {/* Botão de pausa/voltar */}
                <View style={{ position: "absolute", top: 50, right: 20 }}>
                    <Link href="/" asChild>
                        <Pressable style={{ padding: 10 }}>
                            <Text style={{ fontSize: 28 }}>⏸️</Text>
                        </Pressable>
                    </Link>
                </View>

                {/* Instruções de controle (web) */}
                {Platform.OS === "web" && (
                    <View style={{
                        position: "absolute",
                        bottom: 30,
                        left: 0,
                        right: 0,
                        alignItems: "center",
                        pointerEvents: "none"
                    }}>
                        <Text style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 14 }}>
                            ← → ou A/D para mover | ↑ ou SPACE para pular
                        </Text>
                    </View>
                )}
            </View>
        </GestureDetector>
    );
}
