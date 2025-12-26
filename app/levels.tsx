/**
 * @fileoverview Levels - Seleção do Sonho
 * Escolha de cenário/país para jogar
 */

import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

/** Cores do tema */
const COLORS = {
    background: "#221910",
    surface: "#2e241b",
    primary: "#f48c25",
    white: "#ffffff",
    textMuted: "rgba(255,255,255,0.5)",
    brasil: "#22c55e",
    usa: "#3b82f6",
} as const;

interface LevelCardProps {
    readonly title: string;
    readonly description: React.ReactNode;
    readonly color: string;
    readonly difficulty: string;
    readonly difficultyColor: string;
    readonly villains: readonly { icon: string; name: string }[];
    readonly progress: number;
    readonly countryCode: string;
    readonly locked?: boolean;
    readonly onPress: () => void;
}

function LevelCard({
    title,
    description,
    color,
    difficulty,
    difficultyColor,
    villains,
    progress,
    countryCode,
    locked = false,
    onPress,
}: LevelCardProps): React.JSX.Element {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
                locked && styles.cardLocked,
            ]}
            onPress={onPress}
            disabled={locked}
        >
            {/* Image Header */}
            <View style={styles.cardImage}>
                <LinearGradient
                    colors={["transparent", COLORS.surface]}
                    style={styles.cardGradient}
                />
                {/* Country Badge */}
                <View style={[styles.countryBadge, { backgroundColor: color }]}>
                    <Text style={styles.countryCode}>{countryCode}</Text>
                </View>
                {/* Difficulty Badge */}
                <View style={styles.difficultyBadge}>
                    <Text style={[styles.difficultyIcon, { color: difficultyColor }]}>
                        {difficulty === "Extreme" ? "🔥" : "⚡"}
                    </Text>
                    <Text style={styles.difficultyText}>{difficulty}</Text>
                </View>
                {locked && (
                    <View style={styles.lockedOverlay}>
                        <Text style={styles.lockedIcon}>🔒</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color }]}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>

                {/* Villains */}
                <View style={styles.villainsContainer}>
                    {villains.map((villain, index) => (
                        <View
                            key={index}
                            style={[
                                styles.villainChip,
                                { backgroundColor: `${color}20`, borderColor: `${color}40` },
                            ]}
                        >
                            <Text style={styles.villainIcon}>{villain.icon}</Text>
                            <Text style={[styles.villainName, { color }]}>{villain.name}</Text>
                        </View>
                    ))}
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                        <View
                            style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]}
                        />
                    </View>
                    <Text style={styles.progressText}>Progressão: {progress}%</Text>
                </View>
            </View>
        </Pressable>
    );
}

export default function LevelsScreen(): React.JSX.Element {
    const router = useRouter();

    const handlePlayBrasil = (): void => {
        router.push("/game");
    };

    const handlePlayUSA = (): void => {
        // Bloqueado por enquanto
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerBrand}>CORRE DA TAXA!</Text>
                    <Text style={styles.headerTitle}>Seleção do Sonho</Text>
                </View>
                <View style={styles.moneyBadge}>
                    <Text style={styles.moneyIcon}>💰</Text>
                    <Text style={styles.moneyText}>1,402</Text>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Headline */}
                <View style={styles.headline}>
                    <Text style={styles.headlineTitle}>Escolha o seu Destino</Text>
                    <Text style={styles.headlineSubtitle}>
                        Qual pesadelo econômico você vai enfrentar hoje?
                    </Text>
                </View>

                {/* Level Cards */}
                <View style={styles.cardsContainer}>
                    {/* Brasil */}
                    <LevelCard
                        title="O Sonho Brasileiro"
                        description={
                            <Text>
                                Fuja da taxação desenfreada! Desvie do{" "}
                                <Text style={styles.highlight}>Leão do IR</Text> e dos boletos
                                atrasados enquanto tenta comprar um Marea Turbo.
                            </Text>
                        }
                        color={COLORS.brasil}
                        difficulty="Hard"
                        difficultyColor="#facc15"
                        villains={[
                            { icon: "🦁", name: "O Taxador" },
                            { icon: "📄", name: "Zé Boleto" },
                        ]}
                        progress={75}
                        countryCode="BR"
                        onPress={handlePlayBrasil}
                    />

                    {/* USA */}
                    <LevelCard
                        title="O Sonho Americano"
                        description={
                            <Text>
                                A terra da liberdade... de ser deportado! Corra pelo{" "}
                                <Text style={styles.highlight}>Green Card</Text> e evite o muro
                                a todo custo.
                            </Text>
                        }
                        color={COLORS.usa}
                        difficulty="Extreme"
                        difficultyColor="#ef4444"
                        villains={[
                            { icon: "👮", name: "Agente ICE" },
                            { icon: "🧱", name: "O Muro" },
                        ]}
                        progress={25}
                        countryCode="US"
                        locked
                        onPress={handlePlayUSA}
                    />
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.bottomAction}>
                <Pressable
                    style={({ pressed }) => [
                        styles.playButton,
                        pressed && styles.playButtonPressed,
                    ]}
                    onPress={handlePlayBrasil}
                >
                    <Text style={styles.playButtonText}>INICIAR CORRIDA</Text>
                    <Text style={styles.playButtonIcon}>🏁</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: 24,
    },
    headerCenter: {
        alignItems: "center",
    },
    headerBrand: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    moneyBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    moneyIcon: {
        fontSize: 16,
    },
    moneyText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "bold",
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headline: {
        alignItems: "center",
        paddingVertical: 24,
    },
    headlineTitle: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
    },
    headlineSubtitle: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: "center",
    },
    cardsContainer: {
        gap: 24,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "transparent",
    },
    cardPressed: {
        borderColor: "rgba(244, 140, 37, 0.5)",
    },
    cardLocked: {
        opacity: 0.7,
    },
    cardImage: {
        height: 160,
        backgroundColor: "#1a1410",
        position: "relative",
    },
    cardGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    countryBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    countryCode: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "bold",
    },
    difficultyBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    difficultyIcon: {
        fontSize: 12,
    },
    difficultyText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    lockedIcon: {
        fontSize: 48,
    },
    cardContent: {
        padding: 20,
        marginTop: -40,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    cardDescription: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    highlight: {
        color: COLORS.primary,
        fontWeight: "bold",
    },
    villainsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    villainChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    villainIcon: {
        fontSize: 14,
    },
    villainName: {
        fontSize: 12,
        fontWeight: "bold",
    },
    progressContainer: {
        gap: 4,
    },
    progressTrack: {
        height: 4,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: 4,
        borderRadius: 2,
    },
    progressText: {
        color: COLORS.textMuted,
        fontSize: 10,
        textAlign: "right",
    },
    bottomAction: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
    },
    playButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 28,
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    playButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    playButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    playButtonIcon: {
        fontSize: 18,
    },
});
