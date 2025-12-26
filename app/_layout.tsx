import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RootLayout(): React.JSX.Element {
    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#000" },
                }}
            />
        </View>
    );
}
