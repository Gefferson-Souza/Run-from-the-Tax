/**
 * @fileoverview PauseModal - Overlay "Pausa Pro Cafezinho"
 * Modal temático com botões de ação
 */

import React from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useGameStore, useObstacleStore } from "../../stores";

/** Cores do tema */
const COLORS = {
    background: "#221910",
    surface: "#2d2318",
    primary: "#f48c25",
    white: "#ffffff",
    textMuted: "rgba(255,255,255,0.6)",
    border: "rgba(255,255,255,0.05)",
} as const;

interface PauseModalProps {
    readonly visible: boolean;
    readonly onResume: () => void;
}

export function PauseModal({ visible, onResume }: PauseModalProps): React.JSX.Element {
    const router = useRouter();
    const restartGame = useGameStore((state) => state.restartGame);
    const resetObstacles = useObstacleStore((state) => state.resetObstacles);
    const currentMoney = useGameStore((state) => state.currentMoney);
    const score = useGameStore((state) => state.score);

    const handleRestart = (): void => {
        resetObstacles();
        restartGame();
        onResume();
    };

    const handleExit = (): void => {
        resetObstacles();
        router.replace("/");
    };

    const handleSettings = (): void => {
        onResume(); // Fecha pausa antes de navegar
        router.push("/settings");
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconEmoji}>☕</Text>
                        </View>
                        <Text style={styles.title}>PAUSA PARA O{"\n"}CAFEZINHO</Text>
                        <Text style={styles.subtitle}>A economia espera por você...</Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonsContainer}>
                        {/* Continue */}
                        <Pressable
                            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                            onPress={onResume}
                        >
                            <Text style={styles.buttonIcon}>▶️</Text>
                            <Text style={styles.primaryButtonText}>CONTINUAR CORRIDA</Text>
                        </Pressable>

                        <View style={styles.spacer} />

                        {/* Restart */}
                        <Pressable
                            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                            onPress={handleRestart}
                        >
                            <Text style={styles.buttonIcon}>🔄</Text>
                            <Text style={styles.secondaryButtonText}>REINICIAR</Text>
                        </Pressable>

                        {/* Settings */}
                        <Pressable
                            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                            onPress={handleSettings}
                        >
                            <Text style={styles.buttonIcon}>⚙️</Text>
                            <Text style={styles.secondaryButtonText}>CONFIGURAÇÕES</Text>
                        </Pressable>

                        {/* Exit */}
                        <Pressable
                            style={({ pressed }) => [styles.exitButton, pressed && styles.buttonPressed]}
                            onPress={handleExit}
                        >
                            <Text style={styles.buttonIcon}>🚪</Text>
                            <Text style={styles.exitButtonText}>SAIR PARA O MENU</Text>
                        </Pressable>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.stat}>
                            <Text style={styles.statIcon}>💰</Text>
                            <Text style={styles.statText}>R$ {currentMoney.toLocaleString("pt-BR")}</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statIcon}>🏃</Text>
                            <Text style={styles.statText}>{score.toLocaleString("pt-BR")}m</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(34, 25, 16, 0.95)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    container: {
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(58, 45, 32, 0.5)",
        borderWidth: 1,
        borderColor: "rgba(244, 140, 37, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    iconEmoji: {
        fontSize: 40,
    },
    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    subtitle: {
        color: COLORS.textMuted,
        fontSize: 16,
        marginTop: 8,
    },
    buttonsContainer: {
        width: "100%",
        gap: 12,
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 56,
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: "bold",
    },
    secondaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        height: 48,
        gap: 8,
    },
    secondaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600",
    },
    exitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: "rgba(244, 140, 37, 0.2)",
        borderRadius: 12,
        height: 48,
        gap: 8,
        marginTop: 8,
    },
    exitButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonIcon: {
        fontSize: 18,
    },
    spacer: {
        height: 8,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 32,
        marginTop: 32,
        opacity: 0.5,
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statIcon: {
        fontSize: 14,
    },
    statText: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontFamily: "monospace",
    },
});
