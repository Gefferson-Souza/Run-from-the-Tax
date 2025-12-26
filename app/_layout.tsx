import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout(): React.JSX.Element {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View className="flex-1 bg-black">
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: "#000" },
                    }}
                />
            </View>
        </GestureHandlerRootView>
    );
}
