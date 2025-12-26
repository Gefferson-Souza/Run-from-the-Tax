import { Link } from "expo-router";
import { Text, View, Pressable } from "react-native";

export default function HomeScreen(): React.JSX.Element {
    return (
        <View className="flex-1 items-center justify-center bg-black p-4">
            <Text className="text-4xl font-bold text-white mb-2">
                🏃 Corre da Taxa!
            </Text>
            <Text className="text-lg text-gray-400 mb-8 text-center">
                Fuja das taxas e impostos neste endless runner satírico
            </Text>

            <Link href="/game" asChild>
                <Pressable className="bg-money-green px-8 py-4 rounded-xl mb-4 w-64">
                    <Text className="text-white text-xl font-bold text-center">
                        🎮 JOGAR
                    </Text>
                </Pressable>
            </Link>

            <Link href="/shop" asChild>
                <Pressable className="bg-money-gold px-8 py-4 rounded-xl mb-4 w-64">
                    <Text className="text-black text-xl font-bold text-center">
                        🛒 LOJA DA VIDA
                    </Text>
                </Pressable>
            </Link>

            <Link href="/settings" asChild>
                <Pressable className="bg-gray-800 px-8 py-4 rounded-xl w-64">
                    <Text className="text-white text-xl text-center">⚙️ Configurações</Text>
                </Pressable>
            </Link>
        </View>
    );
}
