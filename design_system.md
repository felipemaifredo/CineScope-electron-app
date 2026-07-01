# CineScope - Design System

Este documento define o sistema de design visual adotado para o aplicativo **CineScope**, servindo como guia de consistência para cores, tipografia, layout e componentes.

---

## 1. Cores (Color Palette)

O aplicativo utiliza uma paleta de cores moderna e escura (sleek dark mode) baseada na escala Zinc e com destaque em Indigo.

### Base / Fundo (Backgrounds)
* **True Black (`#000000`)**: Usado como fundo da área de conteúdo principal e na TitleBar customizada.
* **Zinc 950 (`#09090b` / `bg-zinc-950`)**: Usado na barra lateral (Sidebar) para gerar contraste de profundidade.
* **Zinc 900 (`#18181b` / `bg-zinc-900/40`)**: Usado no fundo de cartões (Cards) e Modais.
* **Zinc 800 (`#27272a`)**: Usado em elementos interativos desativados ou fundos de inputs.

### Cores de Destaque (Accents)
* **Indigo 600 (`#4f46e5` / `bg-indigo-600`)**: Cor primária para ações principais, botões ativos, e bordas selecionadas.
* **Indigo 400 (`#818cf8` / `text-indigo-400`)**: Destaque secundário e links textuais.
* **Red 600 (`#dc2626` / `bg-red-600`)**: Cor semântica para perigo, exclusão e remoção (ex: botão de remoção da Watchlist).

---

## 2. Tipografia (Typography)

A fonte principal do CineScope é a **Inter**, acompanhada por fontes de sistema genéricas para otimização de legibilidade.

* **Família**: `Inter, system-ui, Avenir, Helvetica, Arial, sans-serif`
* **Escala de Texto**:
  * **Título Principal (Páginas)**: `text-3xl` (`1.875rem` / `30px`), Negrito (`font-bold`), Tracking Apertado (`tracking-tight`).
  * **Subtítulos**: `text-xl` (`1.25rem` / `20px`), Seminegrito (`font-semibold`).
  * **Texto Geral (Body)**: `text-sm` (`0.875rem` / `14px`), Regular (`font-normal`), Cinza Claro (`text-zinc-300`).
  * **Metadados (Muted)**: `text-xs` (`0.75rem` / `12px`), Regular, Cinza Médio (`text-zinc-500` / `text-zinc-400`).

---

## 3. Layout & Estrutura

### TitleBar Customizada
* **Altura**: `h-8` (`32px`).
* **Fundo**: `#000000`.
* **Comportamento**: Área arrastável (`app-region-drag`), com elementos internos como ícones definidos como não-arrastáveis (`app-region-no-drag`).

### Estrutura Geral da Janela
* **Sidebar Lateral**: Largura fixa de `w-64` (`256px`), posicionada à esquerda, com fundo `bg-zinc-950` e borda direita fina (`border-r border-zinc-800`).
* **Área de Conteúdo**: Flex-1, rolagem vertical (`overflow-y-auto`), com preenchimento interno de `p-8` (`32px`) e degradê radial suave no topo (`from-indigo-900/20 via-black/0`).

---

## 4. Componentes UI (Base Components)

### Botões (Button)
* **Primary**: Fundo `bg-indigo-600`, texto branco, transição de cor no hover para `bg-indigo-700`.
* **Secondary**: Fundo `bg-zinc-800`, texto cinza claro, transição de cor no hover para `bg-zinc-700`.
* **Danger**: Fundo `bg-red-600`, texto branco, transição de cor no hover para `bg-red-700`.
* **Ghost**: Sem fundo, texto cinza claro, hover adiciona fundo `bg-zinc-800` e texto branco.

### Cartões (Card)
* Bordas arredondadas `rounded-xl`, borda fina `border-zinc-800`, fundo `bg-zinc-900/40`.
* Efeito hover adiciona brilho de borda `hover:border-zinc-700` e fundo mais denso.

### Inputs e Selects
* Fundo `bg-zinc-800`, borda fina `border-zinc-700`, cantos `rounded-lg`, texto branco.
* Foco adiciona anel `focus:ring-2 focus:ring-indigo-500` e esconde a borda.
