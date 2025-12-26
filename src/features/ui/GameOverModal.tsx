/**
 * @fileoverview Game Over Modal - Tela de Falência
 * Aparece quando o dinheiro chega a zero
 * Design baseado no mockup: card dark com stats e botões
 */

import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Link, router } from "expo-router";
import { useGameStore, useObstacleStore } from "../../stores";

/** Cores do design */
const COLORS = {
    primary: "#f48c25",
    backgroundDark: "#221910",
    cardDark: "#342618",
    textSecondary: "#cbad90",
    red: "#ef4444",
    green: "#22c55e",
    white: "#ffffff",
} as const;

export function GameOverModal(): React.JSX.Element {
    const score = useGameStore((state) => state.score);
    const moneyEarnedThisRun = useGameStore((state) => state.moneyEarnedThisRun);
    const totalMoney = useGameStore((state) => state.totalMoney);
    const highScore = useGameStore((state) => state.highScore);
    const isNewHighScore = useGameStore((state) => state.isNewHighScore);
    const restartGame = useGameStore((state) => state.restartGame);
    const resetObstacles = useObstacleStore((state) => state.resetObstacles);

    const handleRestart = (): void => {
        resetObstacles();
        restartGame();
    };

    const handleGoToShop = (): void => {
        router.replace("/shop");
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                {/* Badge "Fim da Linha" */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>FIM DA LINHA</Text>
                </View>

                {/* Título */}
                <Text style={styles.title}>
                    FALÊNCIA{"\n"}
                    <Text style={styles.titleHighlight}>DECRETADA!</Text>
                </Text>

                {/* Subtítulo */}
                <Text style={styles.subtitle}>
                    O Leão te pegou na malha fina.{"\n"}
                    Seu poder de compra chegou a zero.
                </Text>

                {/* Imagem/Ícone */}
                <View style={styles.imageContainer}>
                    <Text style={styles.sadEmoji}>😭💸</Text>
                    <View style={styles.causaBadge}>
                        <Text style={styles.causaLabel}>⚖️ Causa Mortis</Text>
                        <Text style={styles.causaText}>Sonegação Fiscal</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {/* Distância */}
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>DISTÂNCIA</Text>
                        <Text style={styles.statValue}>{score.toLocaleString("pt-BR")}m</Text>
                        {isNewHighScore && (
                            <View style={styles.newRecordBadge}>
                                <Text style={styles.newRecordText}>🏆 Novo Recorde!</Text>
                            </View>
                        )}
                    </View>

                    {/* Patrimônio Coletado */}
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>PATRIMÔNIO</Text>
                        <Text style={[styles.statValue, styles.moneyValue]}>
                            R$ {moneyEarnedThisRun.toLocaleString("pt-BR")}
                        </Text>
                        <Text style={styles.savedText}>💰 Salvo no colchão</Text>
                    </View>
                </View>

                {/* Saldo Total */}
                <View style={styles.totalMoneyCard}>
                    <Text style={styles.totalLabel}>Saldo Bancário Total</Text>
                    <Text style={styles.totalValue}>
                        R$ {totalMoney.toLocaleString("pt-BR")}
                    </Text>
                </View>

                {/* Botões */}
                <View style={styles.buttonsContainer}>
                    {/* Botão Principal - Tentar Novamente */}
                    <Pressable style={styles.primaryButton} onPress={handleRestart}>
                        <Text style={styles.primaryButtonIcon}>🔄</Text>
                        <Text style={styles.primaryButtonText}>Tentar Novamente</Text>
                    </Pressable>

                    {/* Botões Secundários */}
                    <View style={styles.secondaryButtons}>
                        <Pressable style={styles.secondaryButton} onPress={handleGoToShop}>
                            <Text style={styles.secondaryButtonIcon}>🏪</Text>
                            <Text style={styles.secondaryButtonText}>Loja da Vida</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Recorde: {highScore.toLocaleString("pt-BR")}m
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: COLORS.backgroundDark,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    badge: {
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.5)",
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginBottom: 12,
    },
    badgeText: {
        color: COLORS.red,
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 2,
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        color: COLORS.white,
        textAlign: "center",
        lineHeight: 36,
        textTransform: "uppercase",
    },
    titleHighlight: {
        color: COLORS.primary,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    imageContainer: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        marginTop: 16,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
    },
    sadEmoji: {
        fontSize: 60,
    },
    causaBadge: {
        position: "absolute",
        bottom: 12,
        left: 12,
    },
    causaLabel: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    causaText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
        width: "100%",
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: "900",
    },
    moneyValue: {
        color: COLORS.primary,
    },
    newRecordBadge: {
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 4,
    },
    newRecordText: {
        color: COLORS.green,
        fontSize: 10,
        fontWeight: "bold",
    },
    savedText: {
        color: "rgba(255, 255, 255, 0.4)",
        fontSize: 10,
        marginTop: 4,
    },
    totalMoneyCard: {
        width: "100%",
        backgroundColor: "rgba(244, 140, 37, 0.1)",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        marginTop: 12,
        borderWidth: 1,
        borderColor: "rgba(244, 140, 37, 0.3)",
    },
    totalLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    totalValue: {
        color: COLORS.primary,
        fontSize: 28,
        fontWeight: "900",
        marginTop: 4,
    },
    buttonsContainer: {
        width: "100%",
        marginTop: 20,
        gap: 12,
    },
    primaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 28,
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
    },
    primaryButtonIcon: {
        fontSize: 20,
    },
    primaryButtonText: {
        color: COLORS.backgroundDark,
        fontSize: 18,
        fontWeight: "900",
    },
    secondaryButtons: {
        flexDirection: "row",
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.cardDark,
        height: 48,
        borderRadius: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    secondaryButtonIcon: {
        fontSize: 16,
    },
    secondaryButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "bold",
    },
    footer: {
        color: "rgba(255, 255, 255, 0.3)",
        fontSize: 12,
        marginTop: 16,
    },
});
