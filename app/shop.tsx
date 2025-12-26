/**
 * @fileoverview Loja da Vida - Meta-Game Economy
 * Interface para comprar upgrades com dinheiro acumulado
 */

import { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    Dimensions,
} from "react-native";
import { Link, router } from "expo-router";
import {
    useGameStore,
    useShopStore,
    ItemType,
    SHOP_CATALOG,
    getItemsByType,
} from "../src/stores";
import type { ShopItem } from "../src/stores";

/** Cores do design */
const COLORS = {
    primary: "#f48c25",
    backgroundDark: "#221910",
    surfaceDark: "#2e2216",
    surfaceHighlight: "#3c2e20",
    white: "#ffffff",
    green: "#22c55e",
    red: "#ef4444",
} as const;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** Card de item da loja */
function ShopItemCard({
    item,
    isOwned,
    canAfford,
    onBuy,
}: {
    readonly item: ShopItem;
    readonly isOwned: boolean;
    readonly canAfford: boolean;
    readonly onBuy: (itemId: string) => void;
}): React.JSX.Element {
    const handlePress = (): void => {
        if (isOwned) return;
        if (!canAfford) {
            if (Platform.OS === "web") {
                alert("Saldo insuficiente! Continue jogando para ganhar mais dinheiro.");
            } else {
                Alert.alert("Saldo insuficiente", "Continue jogando para ganhar mais dinheiro.");
            }
            return;
        }
        onBuy(item.id);
    };

    return (
        <Pressable
            style={[styles.itemCard, isOwned && styles.itemCardOwned]}
            onPress={handlePress}
        >
            {/* Ícone */}
            <View style={styles.itemIconContainer}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                {item.type === ItemType.EDUCATION && (
                    <View style={styles.multiBadge}>
                        <Text style={styles.multiBadgeText}>{item.multiplier}x</Text>
                    </View>
                )}
                {item.type === ItemType.VEHICLE && (
                    <View style={[styles.multiBadge, styles.defenseBadge]}>
                        <Text style={styles.multiBadgeText}>🛡️{item.defense}</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                {/* Footer */}
                <View style={styles.itemFooter}>
                    <Text style={styles.itemType}>
                        {item.type === ItemType.EDUCATION ? "Permanente" : "Permanente"}
                    </Text>

                    {isOwned ? (
                        <View style={styles.ownedBadge}>
                            <Text style={styles.ownedText}>✓ Comprado</Text>
                        </View>
                    ) : canAfford ? (
                        <Pressable style={styles.buyButton} onPress={handlePress}>
                            <Text style={styles.buyButtonText}>
                                R$ {item.cost.toLocaleString("pt-BR")}
                            </Text>
                        </Pressable>
                    ) : (
                        <View style={styles.disabledButton}>
                            <Text style={styles.disabledButtonText}>
                                🔒 R$ {item.cost.toLocaleString("pt-BR")}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

export default function ShopScreen(): React.JSX.Element {
    // Stores
    const totalMoney = useGameStore((state) => state.totalMoney);
    const loadPersistedData = useGameStore((state) => state.loadPersistedData);

    const inventory = useShopStore((state) => state.inventory);
    const selectedTab = useShopStore((state) => state.selectedTab);
    const setSelectedTab = useShopStore((state) => state.setSelectedTab);
    const buyItem = useShopStore((state) => state.buyItem);
    const hasItem = useShopStore((state) => state.hasItem);
    const loadInventory = useShopStore((state) => state.loadInventory);
    const getTotalMultiplier = useShopStore((state) => state.getTotalMultiplier);
    const getTotalDefense = useShopStore((state) => state.getTotalDefense);

    // Carrega dados ao montar
    useEffect(() => {
        loadPersistedData();
        loadInventory();
    }, [loadPersistedData, loadInventory]);

    // Itens filtrados por aba
    const filteredItems = getItemsByType(selectedTab);

    // Stats calculados
    const multiplier = getTotalMultiplier();
    const defense = getTotalDefense();

    // Handler de compra
    const handleBuy = useCallback(
        (itemId: string) => {
            const result = buyItem(itemId);

            if (Platform.OS === "web") {
                alert(result.message);
            } else {
                Alert.alert(result.success ? "Sucesso!" : "Erro", result.message);
            }

            // Recarrega dados para atualizar UI
            loadPersistedData();
        },
        [buyItem, loadPersistedData]
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Link href="/" asChild>
                    <Pressable style={styles.backButton}>
                        <Text style={styles.backButtonText}>⬅️</Text>
                    </Pressable>
                </Link>
                <Text style={styles.headerTitle}>LOJA DA VIDA</Text>
                <View style={styles.backButton} />
            </View>

            {/* Saldo */}
            <View style={styles.balanceContainer}>
                <View style={styles.balanceBadge}>
                    <Text style={styles.balanceIcon}>💰</Text>
                    <Text style={styles.balanceText}>
                        R$ {totalMoney.toLocaleString("pt-BR")}
                    </Text>
                </View>
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>MULTIPLICADOR</Text>
                    <Text style={styles.statValue}>{multiplier.toFixed(1)}x</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>DEFESA</Text>
                    <Text style={styles.statValue}>🛡️ {defense}</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <Pressable
                    style={[styles.tab, selectedTab === ItemType.EDUCATION && styles.tabActive]}
                    onPress={() => setSelectedTab(ItemType.EDUCATION)}
                >
                    <Text style={styles.tabIcon}>🎓</Text>
                    <Text
                        style={[styles.tabText, selectedTab === ItemType.EDUCATION && styles.tabTextActive]}
                    >
                        Educação
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, selectedTab === ItemType.VEHICLE && styles.tabActive]}
                    onPress={() => setSelectedTab(ItemType.VEHICLE)}
                >
                    <Text style={styles.tabIcon}>🚗</Text>
                    <Text
                        style={[styles.tabText, selectedTab === ItemType.VEHICLE && styles.tabTextActive]}
                    >
                        Bens
                    </Text>
                </Pressable>
            </View>

            {/* Items List */}
            <ScrollView style={styles.itemsList} contentContainerStyle={styles.itemsContent}>
                {filteredItems.map((item) => (
                    <ShopItemCard
                        key={item.id}
                        item={item}
                        isOwned={hasItem(item.id)}
                        canAfford={totalMoney >= item.cost}
                        onBuy={handleBuy}
                    />
                ))}
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <Pressable style={styles.playButton} onPress={() => router.replace("/game")}>
                    <Text style={styles.playButtonIcon}>▶️</Text>
                    <Text style={styles.playButtonText}>VOLTAR PARA A CORRIDA</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(244, 140, 37, 0.1)",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonText: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.white,
        letterSpacing: 1,
    },
    balanceContainer: {
        alignItems: "center",
        paddingVertical: 16,
    },
    balanceBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surfaceDark,
        borderWidth: 1,
        borderColor: "rgba(244, 140, 37, 0.2)",
        borderRadius: 30,
        paddingHorizontal: 24,
        paddingVertical: 12,
        gap: 8,
    },
    balanceIcon: {
        fontSize: 24,
    },
    balanceText: {
        fontSize: 28,
        fontWeight: "bold",
        color: COLORS.white,
    },
    statsCard: {
        flexDirection: "row",
        backgroundColor: COLORS.surfaceDark,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statLabel: {
        fontSize: 10,
        fontWeight: "bold",
        color: COLORS.primary,
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.white,
    },
    statDivider: {
        width: 1,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    tabsContainer: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    tab: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 4,
    },
    tabActive: {
        backgroundColor: COLORS.primary,
    },
    tabIcon: {
        fontSize: 20,
    },
    tabText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "rgba(255, 255, 255, 0.5)",
    },
    tabTextActive: {
        color: COLORS.white,
    },
    itemsList: {
        flex: 1,
        marginTop: 16,
    },
    itemsContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
        gap: 12,
    },
    itemCard: {
        flexDirection: "row",
        backgroundColor: COLORS.surfaceDark,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
        gap: 12,
    },
    itemCardOwned: {
        borderColor: COLORS.green,
        opacity: 0.7,
    },
    itemIconContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.surfaceHighlight,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    itemIcon: {
        fontSize: 40,
    },
    multiBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    defenseBadge: {
        backgroundColor: COLORS.green,
    },
    multiBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: COLORS.white,
    },
    itemInfo: {
        flex: 1,
        justifyContent: "space-between",
    },
    itemName: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.white,
    },
    itemDescription: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.6)",
        lineHeight: 16,
    },
    itemFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    itemType: {
        fontSize: 10,
        color: "rgba(255, 255, 255, 0.4)",
        fontWeight: "500",
    },
    buyButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buyButtonText: {
        fontSize: 13,
        fontWeight: "bold",
        color: COLORS.white,
    },
    disabledButton: {
        backgroundColor: COLORS.surfaceHighlight,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    disabledButtonText: {
        fontSize: 13,
        fontWeight: "bold",
        color: "rgba(255, 255, 255, 0.4)",
    },
    ownedBadge: {
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    ownedText: {
        fontSize: 12,
        fontWeight: "bold",
        color: COLORS.green,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 32,
        paddingTop: 48,
        backgroundColor: COLORS.backgroundDark,
    },
    playButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.white,
        height: 56,
        borderRadius: 28,
        gap: 8,
    },
    playButtonIcon: {
        fontSize: 20,
    },
    playButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.backgroundDark,
    },
});
