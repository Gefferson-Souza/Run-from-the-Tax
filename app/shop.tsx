import { Link } from "expo-router";
import { Text, View, Pressable } from "react-native";

export default function ShopScreen(): React.JSX.Element {
    return (
        <View className="flex-1 items-center justify-center bg-black">
            <Text className="text-2xl text-white mb-4">🛒 Loja da Vida</Text>
            <Text className="text-gray-400 mb-8">
                Compre upgrades para evoluir sua vida
            </Text>
            <Link href="/" asChild>
                <Pressable className="bg-money-gold px-6 py-3 rounded-lg">
                    <Text className="text-black text-lg">← Voltar ao Menu</Text>
                </Pressable>
            </Link>
        </View>
    );
}
