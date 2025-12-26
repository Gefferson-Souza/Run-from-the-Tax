/**
 * @fileoverview Garage - Garagem de Veículos
 * Customização e seleção de veículos
 */

import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useShopStore } from "../src/stores";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** Cores do tema */
const COLORS = {
    background: "#221910",
    surface: "#2d2318",
    primary: "#f48c25",
    white: "#ffffff",
    textMuted: "rgba(255,255,255,0.5)",
    success: "#22c55e",
} as const;

/** Veículos disponíveis */
const VEHICLES = [
    {
        id: "bike",
        name: "Bicicleta Velha",
        emoji: "🚲",
        description: "Começo humilde, mas honesto",
        stats: { speed: 1, defense: 0 },
        price: 0,
        unlocked: true,
    },
    {
        id: "scooter",
        name: "Cinquentinha",
        emoji: "🛵",
        description: "A lenda das entregas",
        stats: { speed: 2, defense: 1 },
        price: 500,
        unlocked: true,
    },
    {
        id: "car",
        name: "Uno Escada",
        emoji: "🚗",
        description: "Econômico e espaçoso",
        stats: { speed: 3, defense: 2 },
        price: 1500,
        unlocked: false,
    },
    {
        id: "marea",
        name: "Marea Turbo",
        emoji: "🏎️",
        description: "O sonho brasileiro",
        stats: { speed: 5, defense: 3 },
        price: 5000,
        unlocked: false,
    },
    {
        id: "tank",
        name: "Caveirão",
        emoji: "🚁",
        description: "Imunidade temporária",
        stats: { speed: 2, defense: 5 },
        price: 10000,
        unlocked: false,
    },
] as const;

type VehicleId = (typeof VEHICLES)[number]["id"];

interface VehicleCardProps {
    readonly vehicle: (typeof VEHICLES)[number];
    readonly selected: boolean;
    readonly onSelect: () => void;
}

function VehicleCard({
    vehicle,
    selected,
    onSelect,
}: VehicleCardProps): React.JSX.Element {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.vehicleCard,
                selected && styles.vehicleCardSelected,
                !vehicle.unlocked && styles.vehicleCardLocked,
                pressed && styles.vehicleCardPressed,
            ]}
            onPress={onSelect}
            disabled={!vehicle.unlocked}
        >
            {/* Emoji Vehicle */}
            <View style={styles.vehicleEmoji}>
                <Text style={styles.vehicleEmojiText}>{vehicle.emoji}</Text>
            </View>

            {/* Info */}
            <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleDescription}>{vehicle.description}</Text>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>⚡ Speed</Text>
                        <View style={styles.statBar}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.statSegment,
                                        i < vehicle.stats.speed && styles.statSegmentFilled,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statLabel}>🛡️ Defense</Text>
                        <View style={styles.statBar}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.statSegment,
                                        i < vehicle.stats.defense && styles.statSegmentFilled,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            {/* Status Badge */}
            {!vehicle.unlocked ? (
                <View style={styles.lockBadge}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockPrice}>R$ {vehicle.price.toLocaleString("pt-BR")}</Text>
                </View>
            ) : selected ? (
                <View style={styles.selectedBadge}>
                    <Text style={styles.selectedText}>✓</Text>
                </View>
            ) : null}
        </Pressable>
    );
}

export default function GarageScreen(): React.JSX.Element {
    const router = useRouter();
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleId>("bike");

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>←</Text>
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>🚗 Garagem</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Selected Vehicle Preview */}
            <View style={styles.preview}>
                <View style={styles.previewEmoji}>
                    <Text style={styles.previewEmojiText}>
                        {VEHICLES.find((v) => v.id === selectedVehicle)?.emoji}
                    </Text>
                </View>
                <Text style={styles.previewName}>
                    {VEHICLES.find((v) => v.id === selectedVehicle)?.name}
                </Text>
                <Text style={styles.previewHint}>Veículo Equipado</Text>
            </View>

            {/* Vehicle List */}
            <ScrollView
                style={styles.vehicleList}
                contentContainerStyle={styles.vehicleListContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Seus Veículos</Text>
                {VEHICLES.map((vehicle) => (
                    <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        selected={selectedVehicle === vehicle.id}
                        onSelect={() => vehicle.unlocked && setSelectedVehicle(vehicle.id)}
                    />
                ))}
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.bottomAction}>
                <Pressable
                    style={({ pressed }) => [
                        styles.equipButton,
                        pressed && styles.equipButtonPressed,
                    ]}
                    onPress={() => router.push("/game")}
                >
                    <Text style={styles.equipButtonText}>ENTRAR NA CORRIDA</Text>
                    <Text style={styles.equipButtonIcon}>🏁</Text>
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
        paddingBottom: 16,
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
    headerTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "bold",
    },
    headerSpacer: {
        width: 40,
    },
    preview: {
        alignItems: "center",
        paddingVertical: 32,
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        borderRadius: 24,
        marginBottom: 24,
    },
    previewEmoji: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(244, 140, 37, 0.1)",
        borderWidth: 2,
        borderColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    previewEmojiText: {
        fontSize: 64,
    },
    previewName: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: "bold",
    },
    previewHint: {
        color: COLORS.success,
        fontSize: 12,
        marginTop: 4,
        fontWeight: "600",
    },
    vehicleList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    vehicleListContent: {
        paddingBottom: 100,
    },
    sectionTitle: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 16,
    },
    vehicleCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "transparent",
    },
    vehicleCardSelected: {
        borderColor: COLORS.primary,
    },
    vehicleCardLocked: {
        opacity: 0.6,
    },
    vehicleCardPressed: {
        opacity: 0.9,
    },
    vehicleEmoji: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    vehicleEmojiText: {
        fontSize: 32,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleName: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    vehicleDescription: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    statsContainer: {
        marginTop: 8,
        gap: 4,
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        width: 70,
    },
    statBar: {
        flexDirection: "row",
        gap: 2,
    },
    statSegment: {
        width: 12,
        height: 6,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    statSegmentFilled: {
        backgroundColor: COLORS.primary,
    },
    lockBadge: {
        alignItems: "center",
        gap: 4,
    },
    lockIcon: {
        fontSize: 20,
    },
    lockPrice: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "bold",
    },
    selectedBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.success,
        justifyContent: "center",
        alignItems: "center",
    },
    selectedText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    bottomAction: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
    },
    equipButton: {
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
    equipButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    equipButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    equipButtonIcon: {
        fontSize: 18,
    },
});
