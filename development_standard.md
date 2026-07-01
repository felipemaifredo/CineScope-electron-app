# Padrão de Desenvolvimento Electron (Mai Apps)

Este documento define o padrão arquitetural, tecnológico e de estrutura de pastas adotado para todos os aplicativos Electron da suite **Mai**. Ele deve servir como referência obrigatória para futuras implementações, correções de bugs e novos projetos.

---

## 1. Pilha Tecnológica & Dependências

Todos os projetos utilizam a pilha tecnológica mais recente e atualizada para evitar bugs no ambiente macOS e unificar o comportamento em ambiente de compilação:

* **React**: `^19.2.1` / **React-DOM**: `^19.2.1`
* **Electron**: `^39.2.6`
* **Vite**: `^7.2.6`
* **electron-vite**: `^5.0.0`
* **electron-builder**: `^26.0.12`
* **TypeScript**: `^5.9.3`

---

## 2. Estrutura Física de Diretórios (Arquitetura)

A estrutura física do projeto deve ser rigorosamente separada por processos e obedecer à **Regra Global 8** no front-end:

```
├── electron-builder.yml       # Configurações de empacotamento em yaml isolado
├── electron.vite.config.ts    # Configuração unificada do electron-vite
├── tsconfig.json              # Orquestrador de compilação por referências
├── tsconfig.node.json         # Configuração TypeScript de processos Main/Preload
├── tsconfig.web.json          # Configuração TypeScript do Renderer (React)
├── package.json               # Scripts de execução e dependências gerais
└── src/
    ├── main/                  # Processo Principal do Electron (Node.js)
    │   └── main.ts            # Inicialização e comunicação IPC
    ├── preload/               # Camada segura ContextBridge entre Main e Renderer
    │   ├── preload.ts         # Script preload básico exposto à window
    │   └── *.ts               # Preloads secundários (ex: webview-preload.ts)
    └── renderer/              # Processo Renderer (Vite + React)
        ├── index.html         # Arquivo HTML principal do renderizador
        ├── env.d.ts           # Habilitação das tipagens do Vite (CSS Modules)
        ├── main.tsx           # Ponto de entrada do React DOM
        ├── App/               # Componentes gerais de inicialização do App (Regra 8)
        ├── ui/                # Components e Pages reutilizáveis (Regra 8)
        ├── Lib/               # Hooks customizados e Utils (Regra 8)
        └── Resourses/         # Assets, Fontes e Textos (Regra 8 - escrito com "s")
```

---

## 3. Fluxo de Entrada e Saída de Build

Para evitar acúmulo de arquivos temporários em diretórios diferentes, os outputs do compilador local e final estão unificados:

* **Entrada do Processo Principal**: Declarada na chave `"main"` do `package.json` como:
  ```json
  "main": "./out/main/main.js"
  ```
* **Build Local / Desenvolvimento**: Gerada inteiramente pelo `electron-vite` na pasta **`out/`** (dividida em `main/`, `preload/` e `renderer/`).
* **Instaladores / Empacotamento Final**: Gerados pelo `electron-builder` na pasta **`release/`**.

---

## 4. Scripts Padrão do `package.json`

Os scripts abaixo devem ser colados no `package.json` de todos os projetos para unificar os fluxos de linting, typechecking, desenvolvimento e build final:

```json
"scripts": {
  "lint": "tsc --noEmit",
  "typecheck:node": "tsc --noEmit -p tsconfig.node.json --composite false",
  "typecheck:web": "tsc --noEmit -p tsconfig.web.json --composite false",
  "typecheck": "npm run typecheck:node && npm run typecheck:web",
  "start": "electron-vite preview",
  "dev": "electron-vite dev",
  "build": "npm run typecheck && electron-vite build",
  "postinstall": "electron-builder install-app-deps",
  "build:unpack": "npm run build && electron-builder --dir",
  "build:win": "npm run build && electron-builder --win",
  "build:mac": "npm run build && electron-builder --mac"
}
```

---

## 5. Práticas Recomendadas de Código

1. **Separação de Typescript**: O TypeScript do Renderer (`tsconfig.web.json`) deve usar referências e estender `@electron-toolkit/tsconfig/tsconfig.web.json` para evitar conflito com as APIs de Node.js do Main Process (`tsconfig.node.json`).
2. **Importação do React**: Com o JSX Transform moderno e o React 19, o import implícito elimina a necessidade de `import React from "react"` na raiz dos arquivos que apenas renderizam JSX. Remova imports não utilizados para evitar erros de compilação causados por `"noUnusedLocals": true`.
3. **Acesso Seguro às APIs de Desktop**: Elementos do Renderer devem interagir com APIs do sistema operacional estritamente através do objeto exposto na `window` (ex: `window.electronAPI` ou `window.api`) declarado de forma estrita e segura na pasta `src/preload/`.
