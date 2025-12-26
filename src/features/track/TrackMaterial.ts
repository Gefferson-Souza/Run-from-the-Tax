/**
 * @fileoverview Gerador de Texturas Procedurais para a Pista
 * Cria texturas de canvas para Asfalto, Terra e adiciona detalhes como buracos.
 */

import { RepeatWrapping, CanvasTexture } from "three";
import { GameTheme } from "../game/biome.types";

export function generateTrackTexture(theme: GameTheme): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not create canvas context");

    const w = canvas.width;
    const h = canvas.height;

    // 1. Base Layer (Fundo)
    if (theme === GameTheme.RURAL) {
        ctx.fillStyle = "#5d4037"; // Terra base
        ctx.fillRect(0, 0, w, h);
        addNoise(ctx, w, h, 0.15); // Muita granulação (terra)
    } else if (theme === GameTheme.FAVELA) {
        ctx.fillStyle = "#636e72"; // Asfalto velho
        ctx.fillRect(0, 0, w, h);
        addNoise(ctx, w, h, 0.1); // Granulação média
        addCracks(ctx, w, h); // Rachaduras
    } else {
        // RICH_CITY
        ctx.fillStyle = "#2d3436"; // Asfalto novo escuro
        ctx.fillRect(0, 0, w, h);
        addNoise(ctx, w, h, 0.05); // Pouca granulação
    }

    // 2. Markings (Faixas)
    if (theme !== GameTheme.RURAL) {
        ctx.fillStyle = theme === GameTheme.RICH_CITY ? "#ffffff" : "#dfe6e9";
        // Faixas laterais
        ctx.fillRect(20, 0, 10, h);
        ctx.fillRect(w - 30, 0, 10, h);

        // Faixa central pontilhada
        const dashHeight = 80;
        const gapHeight = 40;
        for (let y = 0; y < h; y += dashHeight + gapHeight) {
            ctx.globalAlpha = theme === GameTheme.FAVELA ? 0.5 : 1.0; // Faixa gasta na favela
            ctx.fillRect(w / 2 - 5, y, 10, dashHeight);
        }
        ctx.globalAlpha = 1.0;
    } else {
        // RURAL - Trilhos de pneu na terra
        ctx.fillStyle = "#3e2723";
        ctx.globalAlpha = 0.3;
        ctx.fillRect(w / 3 - 20, 0, 40, h);
        ctx.fillRect((w * 2) / 3 - 20, 0, 40, h);
        ctx.globalAlpha = 1.0;
    }

    // 3. Details (Buracos/Potholes)
    if (theme === GameTheme.FAVELA) {
        addPotholes(ctx, w, h, 5);
    } else if (theme === GameTheme.RURAL) {
        addPotholes(ctx, w, h, 8); // Mais buracos na terra
    }

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 10); // Repete verticalmente

    return texture;
}

// === Helpers ===

function addNoise(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * intensity * 255;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
}

function addPotholes(ctx: CanvasRenderingContext2D, w: number, h: number, count: number) {
    ctx.fillStyle = "#1e1e1e"; // Buraco escuro
    for (let i = 0; i < count; i++) {
        const x = Math.random() * (w - 100) + 50; // Evita bordas extremas
        const y = Math.random() * (h - 100) + 50;
        const radius = Math.random() * 30 + 10;

        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();

        // Highlights (borda do buraco)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
}

function addCracks(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.strokeStyle = "#2d3436";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;

    for (let i = 0; i < 10; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20);
        ctx.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
}
