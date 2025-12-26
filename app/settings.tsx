import { Link } from "expo-router";
import { Text, View, Pressable } from "react-native";

export default function SettingsScreen(): React.JSX.Element {
    return (
        <View className="flex-1 items-center justify-center bg-black">
            <Text className="text-2xl text-white mb-4">⚙️ Configurações</Text>
            <Text className="text-gray-400 mb-8">Ajustes do jogo</Text>
            <Link href="/" asChild>
                <Pressable className="bg-gray-700 px-6 py-3 rounded-lg">
                    <Text className="text-white text-lg">← Voltar ao Menu</Text>
                </Pressable>
            </Link>
        </View>
    );
}
