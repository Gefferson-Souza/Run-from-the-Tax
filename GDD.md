# 📄 Game Design Document (GDD) - Versão 1.0

**Working Title:** *Corre da Taxa! (Run from the Tax!)*
**Gênero:** Endless Runner Sátírico com Progressão de RPG.
**Plataformas:** Android, iOS, Web (PWA).
**Tech Stack:** Expo (React Native), React Three Fiber (Gráficos), Zustand (Estado).

---

## 1. O Conceito (High Concept)

Um *endless runner* de alta velocidade onde a sobrevivência financeira é o objetivo. O jogo combina a mecânica clássica de desviar de obstáculos com uma sátira social ácida. O jogador não corre apenas por pontuação, mas para evoluir de classe social, enfrentando os "vilões" da economia que tentam drenar seus recursos.

### O Diferencial (The Hook)

Diferente do Subway Surfers, onde você compra skins estéticas, aqui você compra **Status Social**. O dinheiro coletado na corrida é usado no "Meta Game" para sair da pobreza, comprar bens duráveis e melhorar sua vida, mudando visualmente o gameplay.

---

## 2. Mecânicas Principais (Core Loop)

### 2.1. A Corrida (The Run)

* **Perspectiva:** 3ª Pessoa, Câmera traseira levemente elevada (Estilo Subway Surfers).
* **Movimentação:** 3 Pistas (Esquerda, Meio, Direita).
* **Inputs:**
* *Swipe Esquerda/Direita:* Troca de pista.
* *Swipe Cima:* Pulo (pular buracos, barricadas baixas).
* *Swipe Baixo:* Deslizar/Agachar (passar sob cancelas de pedágio).


* **Aceleração:** O jogo começa lento (a pé) e acelera conforme o tempo passa ou conforme o veículo melhora.

### 2.2. O Sistema de "Dano"

Aqui entra a sátira. Você não "morre" imediatamente ao bater em tudo.

* **Colisão Leve (ex: Taxa do Haddad):** Você perde moedas (Dinheiro voa do bolso). Se o saldo zerar e bater de novo → Game Over (Falência).
* **Colisão Pesada (ex: Muro do Trump / Grade da Receita Federal):** Game Over imediato (Preso/Deportado).

---

## 3. Personagens e Inimigos (The Cast)

### O Protagonista (Personalizável via Tema)

O jogador é um "Avatar" que muda conforme a progressão.

1. **Nível 1:** A pé, roupas simples, chinelo.
2. **Nível 2:** Bicicleta de entrega.
3. **Nível 3:** Moto (CG 160) barulhenta.
4. **Nível 4:** Carro Popular (Uno com escada).
5. **Nível 5:** Carro de Luxo (O objetivo final).

### Os Antagonistas (Obstáculos Dinâmicos)

Eles não correm atrás de você (como o guarda do Subway), eles *jogam* coisas em você ou bloqueiam o caminho.

* **Tema Brasil:**
* *Haddad:* Aparece nas laterais jogando boletos e taxas (projéteis).
* *Lula:* Cria pedágios repentinos que exigem que você mude de pista ou pague (perca moedas).
* *Buracos de Rua:* Obstáculos fixos no chão.


* **Tema Imigrante (EUA):**
* *Trump:* Constrói pedaços de muro instantaneamente na sua frente.
* *Agentes da ICE:* Tentam te agarrar (quick time event ou desvio rápido).



---

## 4. Meta-Game e Economia (Progression)

O jogo tem dois loops:

1. **Loop Curto (A Partida):** Correr, pegar moedas, sobreviver o máximo possível.
2. **Loop Longo (A Vida):** Usar o dinheiro acumulado para upgrades permanentes.

### A Loja da Vida (Menu Principal)

O jogador gasta o dinheiro acumulado em:

* **Educação:** "Curso Técnico", "Faculdade", "Inglês Fluente". (Aumenta o multiplicador de pontuação - representa salário maior).
* **Bens:** "Comprar Moto", "Casar", "Comprar Casa". (Funciona como "Vidas Extras" ou armadura. Se você tem moto e bate, você perde a moto e volta a correr a pé, mas não dá Game Over).
* **Power-ups:** "Sonegação Legal" (Imã de moedas), "Habeas Corpus" (Revive uma vez).

---

## 5. Arquitetura Técnica (React Native Stack)

Como vamos priorizar engenharia sólida:

* **Engine:** **React Three Fiber (R3F)** dentro do **Expo**.
* *Por que:* Permite usar modelos 3D simples (low poly) para as pistas e personagens, o que dá a perspectiva correta e fluidez de 60fps, mas programando em React declarativo.


* **Gerenciamento de Temas (Architecture Pattern):**
* Criaremos um arquivo de configuração JSON/Object chamado `ThemeManifest`.
* Ele dita: `Assets`, `Music`, `EnemyBehavior`.
* Ao iniciar o jogo, o usuário escolhe o "Sonho" (Brasileiro ou Americano) e o app injeta o manifesto correspondente. Isso torna o código 100% reutilizável.


* **Performance:**
* Uso de instanced meshes (para renderizar moedas infinitas sem travar o celular).
* Reaproveitamento de objetos (Object Pooling) para não estourar a memória do celular.