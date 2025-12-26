/**
 * @fileoverview Settings Screen - Ajustes Burocráticos
 * Configurações de volume, gráficos e reset de progresso
 */

import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    Switch,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useGameStore, useShopStore } from "../src/stores";

/** Cores do tema */
const COLORS = {
    background: "#221910",
    surface: "#2d2318",
    surfaceLight: "#3d2e22",
    primary: "#f48c25",
    white: "#ffffff",
    textMuted: "rgba(255,255,255,0.6)",
    border: "rgba(255,255,255,0.05)",
    danger: "#ef4444",
} as const;

export default function SettingsScreen(): React.JSX.Element {
    const router = useRouter();
    const restartGame = useGameStore((state) => state.restartGame);

    // Estados locais (futuramente persistir)
    const [musicVolume, setMusicVolume] = useState(80);
    const [sfxVolume, setSfxVolume] = useState(50);
    const [lowGraphics, setLowGraphics] = useState(false);

    const handleReset = (): void => {
        Alert.alert(
            "⚠️ Declarar Falência",
            "Tem certeza? Todo seu progresso será apagado permanentemente!",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Apagar Tudo",
                    style: "destructive",
                    onPress: () => {
                        restartGame();
                        router.replace("/");
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Ajustes Burocráticos</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Audio Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🔊</Text>
                        <Text style={styles.sectionTitle}>Volume</Text>
                    </View>

                    {/* Music Slider */}
                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.sliderLabel}>Música Tema</Text>
                            <Text style={styles.sliderValue}>{musicVolume}%</Text>
                        </View>
                        <View style={styles.sliderTrack}>
                            <View style={[styles.sliderFill, { width: `${musicVolume}%` }]} />
                            <Pressable
                                style={[styles.sliderThumb, { left: `${musicVolume}%` }]}
                                onPress={() => setMusicVolume((v) => Math.min(100, v + 10))}
                            />
                        </View>
                    </View>

                    {/* SFX Slider */}
                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.sliderLabel}>
                                Efeitos Sonoros{" "}
                                <Text style={styles.sliderHint}>(Gritos do Leão)</Text>
                            </Text>
                            <Text style={styles.sliderValue}>{sfxVolume}%</Text>
                        </View>
                        <View style={styles.sliderTrack}>
                            <View style={[styles.sliderFill, { width: `${sfxVolume}%` }]} />
                            <Pressable
                                style={[styles.sliderThumb, { left: `${sfxVolume}%` }]}
                                onPress={() => setSfxVolume((v) => Math.min(100, v + 10))}
                            />
                        </View>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Graphics Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🎮</Text>
                        <Text style={styles.sectionTitle}>Gráficos</Text>
                    </View>

                    <View style={styles.toggleContainer}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Modo 'Celular do Milhão'</Text>
                            <Text style={styles.toggleHint}>Economia de Bateria / Baixo Gráfico</Text>
                        </View>
                        <Switch
                            value={lowGraphics}
                            onValueChange={setLowGraphics}
                            trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                            thumbColor={COLORS.white}
                        />
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.dangerButton,
                            pressed && styles.dangerButtonPressed,
                        ]}
                        onPress={handleReset}
                    >
                        <Text style={styles.dangerIcon}>⚠️</Text>
                        <Text style={styles.dangerText}>
                            Apagar Progresso (Declarar Falência)
                        </Text>
                    </Pressable>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerBrand}>CORRE DA TAXA!</Text>
                    <Text style={styles.footerVersion}>
                        Versão 1.0.2 - Build:{" "}
                        <Text style={styles.footerBuildName}>Sonegador</Text>
                    </Text>
                </View>
            </ScrollView>
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
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonText: {
        color: COLORS.white,
        fontSize: 24,
    },
    headerTitle: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: "bold",
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    sectionIcon: {
        fontSize: 20,
    },
    sectionTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    sliderContainer: {
        marginBottom: 20,
    },
    sliderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sliderLabel: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 14,
        fontWeight: "500",
    },
    sliderHint: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
    },
    sliderValue: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: "bold",
        fontFamily: "monospace",
    },
    sliderTrack: {
        height: 6,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 3,
        position: "relative",
    },
    sliderFill: {
        height: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    sliderThumb: {
        position: "absolute",
        top: -7,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        marginLeft: -10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: 8,
    },
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(45, 35, 24, 0.5)",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 16,
    },
    toggleInfo: {
        flex: 1,
        marginRight: 16,
    },
    toggleLabel: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "500",
    },
    toggleHint: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
        marginTop: 4,
    },
    dangerButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.5)",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    dangerButtonPressed: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: COLORS.danger,
    },
    dangerIcon: {
        fontSize: 18,
    },
    dangerText: {
        color: COLORS.danger,
        fontSize: 14,
        fontWeight: "bold",
    },
    footer: {
        alignItems: "center",
        marginTop: 32,
        marginBottom: 48,
        gap: 4,
    },
    footerBrand: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    footerVersion: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 12,
        fontFamily: "monospace",
    },
    footerBuildName: {
        color: "rgba(244, 140, 37, 0.6)",
    },
});
