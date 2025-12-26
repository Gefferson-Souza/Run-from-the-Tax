# 🇧🇷 Bestiário Brasileiro - Design de Entidades

## Visão Geral

Este documento define todas as entidades do jogo "Corre da Taxa", organizadas em três categorias:

| Categoria          | Efeito            | Cor           |
| ------------------ | ----------------- | ------------- |
| 💀 **LETHAL**      | Morte instantânea | Roxo          |
| 💸 **FINANCIAL**   | Dano em dinheiro  | Vermelho      |
| 💰 **COLLECTIBLE** | Ganho de recursos | Dourado/Verde |

---

## 💀 Obstáculos LETAIS (5 tipos)

Colidir = **Game Over imediato**

| ID               | Nome                 | Emoji | Peso | Mensagem de Morte       |
| ---------------- | -------------------- | ----- | ---- | ----------------------- |
| `danger_moto`    | Dois Caras numa Moto | 🏍️    | 8%   | "Dois Caras numa Moto"  |
| `danger_marea`   | Marea Turbo          | 🚗    | 4%   | "Atropelado pelo Marea" |
| `danger_pitbull` | Cachorro Caramelo    | 🐕    | 5%   | "Mordido pelo Caramelo" |
| `danger_bueiro`  | Bueiro Aberto        | ⚫    | 3%   | "Caiu no Bueiro"        |
| `danger_cerol`   | Linha de Pipa        | 🪁    | 2%   | "Cerol na Jugular"      |

---

## 💸 Obstáculos FINANCEIROS (6 tipos)

Colidir = **Perde dinheiro** (pode ficar negativo)

| ID              | Nome               | Emoji | Tipo | Dano         | Peso |
| --------------- | ------------------ | ----- | ---- | ------------ | ---- |
| `tax_leao`      | Leão da Receita    | 🦁    | %    | 15% do total | 5%   |
| `tax_pix`       | Taxa do Pix        | 📱    | Fixo | R$ 50        | 20%  |
| `tax_pedagio`   | Pedágio Sem Parar  | 🚧    | Fixo | R$ 100       | 15%  |
| `tax_blusinhas` | Taxa das Blusinhas | 📦    | Fixo | R$ 150       | 10%  |
| `tax_ipva`      | IPVA Atrasado      | 📋    | Fixo | R$ 200       | 8%   |
| `tax_boleto`    | Boleto Vencido     | 📄    | Fixo | R$ 75        | 15%  |

---

## 💰 Coletáveis (6 tipos)

Colidir = **Ganha recursos**

| ID               | Nome             | Emoji | Tipo     | Valor        | Peso |
| ---------------- | ---------------- | ----- | -------- | ------------ | ---- |
| `coin_moeda`     | Moedinha         | 🪙    | Dinheiro | R$ 50        | 20%  |
| `coin_nota`      | Nota de 100      | 💵    | Dinheiro | R$ 100       | 8%   |
| `coin_pix`       | Pix Recebido     | 📱    | Dinheiro | R$ 75        | 5%   |
| `coin_13`        | Décimo Terceiro  | 🎁    | Dinheiro | R$ 200       | 2%   |
| `powerup_shield` | Escudo Anti-Taxa | 🛡️    | Power-up | 5s imunidade | 1%   |
| `powerup_magnet` | Ímã de Dinheiro  | 🧲    | Power-up | 10s atração  | 1%   |

---

## 📊 Sistema de Spawn

### Pesos por Categoria (Base)

```
LETHAL:      15%
FINANCIAL:   50%
COLLECTIBLE: 35%
```

### Ajuste por Distância

A cada 1000m percorridos:

- **LETHAL**: +10%
- **FINANCIAL**: +20%
- **COLLECTIBLE**: -20% (mínimo 15%)

### Regras de Proteção

1. Sem obstáculos LETAIS nas primeiras 3 ondas
2. Máximo 2 obstáculos por onda
3. Sem 2 LETAIS na mesma onda

---

## 🎨 Paleta de Cores

| Categoria   | Cor Principal | Hex       |
| ----------- | ------------- | --------- |
| LETHAL      | Roxo          | `#7c3aed` |
| FINANCIAL   | Vermelho      | `#ef4444` |
| COLLECTIBLE | Dourado       | `#fbbf24` |
| Power-up    | Azul          | `#3b82f6` |

---

## 📁 Implementação

Arquivo principal: `src/features/enemies/obstacle.types.ts`

```typescript
// Exemplo de uso
import { getCategory, DamageCategory, LethalType } from "./obstacle.types";

const type = LethalType.MOTO;
const category = getCategory(type); // DamageCategory.LETHAL
```
