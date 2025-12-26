// NativeWind/Tailwind removido - usando StyleSheet nativo

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/** Cor de fundo dark do design */
const BACKGROUND_DARK = "#221910";

export default function RootLayout(): React.JSX.Element {
    return (
        <GestureHandlerRootView style={styles.root}>
            <View style={styles.container}>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: BACKGROUND_DARK },
                        animation: "fade",
                    }}
                />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BACKGROUND_DARK,
    },
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_DARK,
    },
});
