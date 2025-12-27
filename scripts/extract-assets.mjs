/**
 * @file extract-assets.mjs
 * Extrai objetos específicos do ph_hidden_alley.glb baseado em nomes de materiais
 * 
 * Uso: node extract-assets.mjs
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions';
import { prune, dedup, cloneDocument, draco, quantize } from '@gltf-transform/functions';
import draco3d from 'draco3d';
import fs from 'fs';
import path from 'path';

const INPUT = 'textures/ph_hidden_alley.glb';
const OUTPUT_DIR = 'assets/models/extracted';

// Materiais a extrair (baseado na inspeção e Bestiário)
const TARGETS = [
    { materialPattern: /metal_trash_can/i, output: 'trashcan.glb' },
    { materialPattern: /barrel/i, output: 'barrel.glb' },
    { materialPattern: /cardboard_box/i, output: 'box.glb' },
    { materialPattern: /covered_car/i, output: 'car.glb' },
    { materialPattern: /street_lamp/i, output: 'streetlamp.glb' },
    { materialPattern: /modular_factory_facade.*building_01/i, output: 'building_01.glb' },
    // Novos do Bestiário
    { materialPattern: /water_manhole/i, output: 'manhole.glb' },
    { materialPattern: /concrete_road_barrier/i, output: 'concrete_barrier.glb' },
    { materialPattern: /plastic_monobloc_chair/i, output: 'chair.glb' },
    { materialPattern: /street_rat/i, output: 'rat.glb' },
    { materialPattern: /utility_box/i, output: 'utility_box.glb' },
    { materialPattern: /boombox/i, output: 'boombox.glb' },
    { materialPattern: /security_camera/i, output: 'camera.glb' }
];

async function main() {
    const io = new NodeIO()
        .registerExtensions(ALL_EXTENSIONS)
        .registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        });

    console.log(`📦 Carregando ${INPUT}...`);
    const document = await io.read(INPUT);
    const root = document.getRoot();

    const allMaterials = root.listMaterials();
    console.log(`🎨 Total de materiais: ${allMaterials.length}`);

    // Para cada target, criar documento separado
    for (const target of TARGETS) {
        console.log(`\n🔍 Buscando: ${target.materialPattern}`);

        // Clone do documento
        const clone = await cloneDocument(document);
        const cloneRoot = clone.getRoot();

        // Encontra meshes que usam o material alvo
        const matchingMaterials = cloneRoot.listMaterials()
            .filter(m => target.materialPattern.test(m.getName() || ''));

        if (matchingMaterials.length === 0) {
            console.log(`⚠️  Nenhum material encontrado para ${target.materialPattern}`);
            continue;
        }

        console.log(`✅ Encontrados ${matchingMaterials.length} materiais`);

        // Remove assets não utilizados
        // 1. Encontra primitives que usamos
        const matchingPrimitives = [];
        for (const mesh of cloneRoot.listMeshes()) {
            for (const prim of mesh.listPrimitives()) {
                const mat = prim.getMaterial();
                if (mat && matchingMaterials.includes(mat)) {
                    matchingPrimitives.push({ mesh, prim });
                }
            }
        }

        if (matchingPrimitives.length === 0) {
            console.log(`⚠️  Nenhuma geometria encontrada`);
            continue;
        }

        // 2. Remove meshes que não usam os materiais
        for (const mesh of cloneRoot.listMeshes()) {
            const isMatching = mesh.listPrimitives().some(p => {
                const mat = p.getMaterial();
                return mat && matchingMaterials.includes(mat);
            });
            if (!isMatching) {
                mesh.dispose();
            }
        }

        // 3. Remove nodes vazios
        for (const node of cloneRoot.listNodes()) {
            if (!node.getMesh()) {
                // Se não tem mesh e não tem filhos, tchau
                if (node.listChildren().length === 0) {
                    node.dispose();
                }
            }
        }

        // Optimization Pipeline
        // Prune unused, remove dupes, quantize, compress
        await clone.transform(
            prune(),
            dedup(),
            quantize(), // Reduce precision for size
            draco({ compressionLevel: 7 }) // Strong compression
        );

        // Salva
        const outputPath = path.join(OUTPUT_DIR, target.output);
        await io.write(outputPath, clone);

        const stats = fs.statSync(outputPath);
        console.log(`💾 Salvo: ${outputPath} (${(stats.size / 1024).toFixed(2)} KB)`);
    }

    console.log('\n✅ Extração concluída!');
}

main().catch(console.error);
