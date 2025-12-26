/**
 * @fileoverview Menu Principal - Tela de Boas-vindas
 * Design conforme mockup: Dark theme, botão laranja, visual moderno
 */

import { Link } from "expo-router";
import { Text, View, Pressable, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGameStore } from "../src/stores";

/** Cores do design */
const COLORS = {
    primary: "#f48c25",
    backgroundDark: "#221910",
    white: "#ffffff",
    gray: "#9ca3af",
    darkGray: "#374151",
} as const;

export default function HomeScreen(): React.JSX.Element {
    const totalMoney = useGameStore((state) => state.totalMoney);
    const highScore = useGameStore((state) => state.highScore);

    return (
        <View style={styles.container}>
            {/* Gradiente de fundo sutil */}
            <View style={styles.gradientOverlay} />

            {/* Header com moedas */}
            <View style={styles.header}>
                <View style={styles.currencyBadge}>
                    <Text style={styles.currencyIcon}>💰</Text>
                    <Text style={styles.currencyText}>
                        R$ {totalMoney.toLocaleString("pt-BR")}
                    </Text>
                </View>

                <Pressable style={styles.iconButton}>
                    <Text style={styles.iconText}>⚙️</Text>
                </Pressable>
            </View>

            {/* Área do herói */}
            <View style={styles.heroArea}>
                <View style={styles.heroImage}>
                    <Text style={styles.heroEmoji}>🏃</Text>
                </View>
            </View>

            {/* Título do jogo */}
            <View style={styles.titleArea}>
                <Text style={styles.title}>
                    CORRE DA{"\n"}
                    <Text style={styles.titleHighlight}>TAXA!</Text>
                </Text>
                <View style={styles.titleUnderline} />
                <Text style={styles.tagline}>
                    Fuja dos impostos antes que eles te peguem!
                </Text>
                <Text style={styles.season}>TEMPORADA: INFLAÇÃO ALTA</Text>
            </View>

            {/* Botões de ação */}
            <View style={styles.buttonsArea}>
                {/* Botão principal - JOGAR */}
                <Link href="/game" asChild>
                    <Pressable style={styles.primaryButton}>
                        <Text style={styles.primaryButtonIcon}>🏃</Text>
                        <Text style={styles.primaryButtonText}>INICIAR CORRIDA</Text>
                    </Pressable>
                </Link>

                {/* Botão secundário - Loja */}
                <Link href="/shop" asChild>
                    <Pressable style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonIcon}>🛒</Text>
                        <Text style={styles.secondaryButtonText}>Loja da Vida</Text>
                    </Pressable>
                </Link>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                {highScore > 0 && (
                    <Text style={styles.highScore}>🏆 Recorde: {highScore}m</Text>
                )}
                <Text style={styles.version}>v1.0.0-beta • Server: Brasil-Sil-Sil</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingBottom: 20,
    },
    gradientOverlay: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 300,
        height: 300,
        backgroundColor: COLORS.primary,
        opacity: 0.05,
        borderRadius: 150,
        transform: [{ translateX: 100 }, { translateY: -100 }],
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    currencyBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    currencyIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    currencyText: {
        color: COLORS.white,
        fontWeight: "bold",
        fontSize: 14,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        justifyContent: "center",
        alignItems: "center",
    },
    iconText: {
        fontSize: 24,
    },
    heroArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
    },
    heroImage: {
        width: "100%",
        aspectRatio: 4 / 5,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        maxHeight: 280,
    },
    heroEmoji: {
        fontSize: 100,
    },
    titleArea: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 44,
        fontWeight: "900",
        color: COLORS.white,
        textAlign: "center",
        lineHeight: 48,
        letterSpacing: -1,
        textTransform: "uppercase",
        fontStyle: "italic",
        transform: [{ rotate: "-2deg" }],
    },
    titleHighlight: {
        color: COLORS.primary,
    },
    titleUnderline: {
        width: 200,
        height: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
        marginTop: 8,
        transform: [{ rotate: "1deg" }],
    },
    tagline: {
        color: COLORS.gray,
        fontSize: 16,
        marginTop: 16,
        textAlign: "center",
        maxWidth: 280,
    },
    season: {
        color: COLORS.primary,
        opacity: 0.6,
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 2,
        marginTop: 8,
    },
    buttonsArea: {
        gap: 12,
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        height: 64,
        borderRadius: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    primaryButtonIcon: {
        fontSize: 28,
        marginRight: 8,
    },
    primaryButtonText: {
        color: COLORS.backgroundDark,
        fontSize: 20,
        fontWeight: "900",
        letterSpacing: 1,
    },
    secondaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    secondaryButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    secondaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    footer: {
        alignItems: "center",
        marginTop: 20,
        gap: 4,
    },
    highScore: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: "bold",
    },
    version: {
        color: "rgba(255, 255, 255, 0.2)",
        fontSize: 10,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
});
