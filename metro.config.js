const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Adiciona suporte para arquivos GLB e outras extensões 3D
config.resolver.assetExts.push("glb", "gltf", "obj", "mtl");

// Força resolução CJS para zustand (evita import.meta em arquivos ESM)
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'zustand' || moduleName.startsWith('zustand/')) {
        return {
            type: 'sourceFile',
            filePath: require.resolve(moduleName),
        };
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;