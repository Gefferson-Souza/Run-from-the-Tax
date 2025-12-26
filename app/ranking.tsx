/**
 * @fileoverview Ranking - Ranking dos Sobreviventes
 * Podium top 3 + lista scrollável com posição do jogador
 */

import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useGameStore } from "../src/stores";

/** Cores do tema */
const COLORS = {
    background: "#121212",
    surface: "#1e1e1e",
    primary: "#f48c25",
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    white: "#ffffff",
    textMuted: "rgba(255,255,255,0.5)",
} as const;

/** Dados mockados do ranking */
const MOCK_RANKING = [
    { rank: 1, name: "Rei do Pix", title: "Investidor", score: 999999 },
    { rank: 2, name: "Faria Limer", title: "Day Trader", score: 850000 },
    { rank: 3, name: "Crypto Bro", title: "HODLer", score: 720000 },
    { rank: 4, name: "Sonegador Jr", title: "Investidor de Risco", score: 600000 },
    { rank: 5, name: "Primo Rico", title: "Coach Financeiro", score: 550000 },
    { rank: 6, name: "Dona da Pensão", title: "Empreendedora", score: 480000 },
    { rank: 7, name: "Taxadad", title: "Contadora", score: 320000 },
] as const;

interface RankingItemProps {
    readonly rank: number;
    readonly name: string;
    readonly title: string;
    readonly score: number;
}

function RankingItem({ rank, name, title, score }: RankingItemProps): React.JSX.Element {
    return (
        <View style={styles.rankingItem}>
            <Text style={styles.rankNumber}>{rank}</Text>
            <View style={styles.rankAvatar}>
                <Text style={styles.rankAvatarText}>👤</Text>
            </View>
            <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{name}</Text>
                <Text style={styles.rankTitle}>{title}</Text>
            </View>
            <Text style={styles.rankScore}>R$ {score.toLocaleString("pt-BR")}</Text>
        </View>
    );
}

export default function RankingScreen(): React.JSX.Element {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
    const totalMoney = useGameStore((state) => state.totalMoney);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Ranking dos Sobreviventes</Text>
                    <Text style={styles.headerIcon}>🏆</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <View style={styles.tabs}>
                    <Pressable
                        style={[styles.tab, activeTab === "global" && styles.tabActive]}
                        onPress={() => setActiveTab("global")}
                    >
                        <Text style={[styles.tabText, activeTab === "global" && styles.tabTextActive]}>
                            Global
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, activeTab === "friends" && styles.tabActive]}
                        onPress={() => setActiveTab("friends")}
                    >
                        <Text style={[styles.tabText, activeTab === "friends" && styles.tabTextActive]}>
                            Amigos
                        </Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Podium */}
                <View style={styles.podium}>
                    {/* 2nd Place */}
                    <View style={styles.podiumItem}>
                        <View style={[styles.podiumAvatar, styles.podiumAvatarSilver]}>
                            <Text style={styles.podiumRank}>#2</Text>
                        </View>
                        <Text style={styles.podiumName}>Faria Limer</Text>
                        <Text style={styles.podiumScoreSilver}>R$ 850.000</Text>
                    </View>

                    {/* 1st Place */}
                    <View style={[styles.podiumItem, styles.podiumItemFirst]}>
                        <Text style={styles.crownIcon}>👑</Text>
                        <View style={[styles.podiumAvatar, styles.podiumAvatarGold]}>
                            <Text style={styles.podiumRankFirst}>#1</Text>
                        </View>
                        <Text style={styles.podiumNameFirst}>Rei do Pix</Text>
                        <Text style={styles.podiumScoreGold}>R$ 999.999</Text>
                    </View>

                    {/* 3rd Place */}
                    <View style={styles.podiumItem}>
                        <View style={[styles.podiumAvatar, styles.podiumAvatarBronze]}>
                            <Text style={styles.podiumRank}>#3</Text>
                        </View>
                        <Text style={styles.podiumName}>Crypto Bro</Text>
                        <Text style={styles.podiumScoreBronze}>R$ 720.000</Text>
                    </View>
                </View>

                {/* Ranking List */}
                <View style={styles.rankingList}>
                    {MOCK_RANKING.slice(3).map((item) => (
                        <RankingItem key={item.rank} {...item} />
                    ))}
                </View>
            </ScrollView>

            {/* User Footer */}
            <View style={styles.userFooter}>
                <View style={styles.userFooterInner}>
                    <View style={styles.userRankContainer}>
                        <Text style={styles.userRankLabel}>Rank</Text>
                        <Text style={styles.userRankValue}>#4502</Text>
                    </View>
                    <View style={styles.userDivider} />
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>😎</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>Pagador de DARF</Text>
                        <Text style={styles.userTitle}>Cidadão Comum</Text>
                    </View>
                    <View style={styles.userScoreContainer}>
                        <Text style={styles.userScoreLabel}>Score</Text>
                        <Text style={styles.userScoreValue}>R$ {totalMoney.toLocaleString("pt-BR")}</Text>
                    </View>
                </View>
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
        backgroundColor: COLORS.background,
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
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    headerIcon: {
        fontSize: 20,
    },
    headerSpacer: {
        width: 40,
    },
    tabsContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: COLORS.background,
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    tabActive: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    tabText: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: "500",
    },
    tabTextActive: {
        color: COLORS.white,
        fontWeight: "bold",
    },
    content: {
        flex: 1,
    },
    podium: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 32,
        gap: 8,
    },
    podiumItem: {
        alignItems: "center",
        width: "30%",
    },
    podiumItemFirst: {
        marginBottom: 16,
    },
    crownIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    podiumAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        marginBottom: 8,
    },
    podiumAvatarGold: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderColor: COLORS.gold,
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    podiumAvatarSilver: {
        borderColor: COLORS.silver,
    },
    podiumAvatarBronze: {
        borderColor: COLORS.bronze,
    },
    podiumRank: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "bold",
    },
    podiumRankFirst: {
        color: COLORS.gold,
        fontSize: 18,
        fontWeight: "bold",
    },
    podiumName: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
    },
    podiumNameFirst: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    podiumScoreGold: {
        color: COLORS.gold,
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 4,
    },
    podiumScoreSilver: {
        color: COLORS.silver,
        fontSize: 11,
        fontWeight: "bold",
        marginTop: 4,
    },
    podiumScoreBronze: {
        color: COLORS.bronze,
        fontSize: 11,
        fontWeight: "bold",
        marginTop: 4,
    },
    rankingList: {
        paddingHorizontal: 16,
        gap: 12,
        paddingBottom: 120,
    },
    rankingItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    rankNumber: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: "bold",
        width: 24,
        textAlign: "center",
    },
    rankAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    rankAvatarText: {
        fontSize: 20,
    },
    rankInfo: {
        flex: 1,
        marginLeft: 12,
    },
    rankName: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: "600",
    },
    rankTitle: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    rankScore: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: "bold",
    },
    userFooter: {
        position: "absolute",
        bottom: 24,
        left: 16,
        right: 16,
    },
    userFooterInner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(244, 140, 37, 0.5)",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    userRankContainer: {
        alignItems: "center",
        minWidth: 48,
    },
    userRankLabel: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    userRankValue: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    userDivider: {
        width: 1,
        height: 40,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginHorizontal: 12,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.surface,
    },
    userAvatarText: {
        fontSize: 24,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    userTitle: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    userScoreContainer: {
        alignItems: "flex-end",
    },
    userScoreLabel: {
        color: COLORS.textMuted,
        fontSize: 11,
    },
    userScoreValue: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "bold",
    },
});
