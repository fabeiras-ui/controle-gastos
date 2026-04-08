# 🚀 Core Tech Stack & Regras de Ouro

## Tecnologias
- **Framework:** Next.js 16.1+ (App Router)
- **Runtime:** React 19 (Suporte a Server Components por padrão)
- **Linguagem:** TypeScript (Strict Mode)

## Regras de Ouro de Código
- **NUNCA use `any`:** Tipagem forte é obrigatória. Use `unknown` se necessário, mas prefira definir interfaces ou tipos do Prisma.
- **Server Components por padrão:** Só adicione `"use client"` se houver interatividade real (hooks ou Browser APIs).
- **Nomenclatura:** 
  - Componentes: PascalCase.
  - Funções/Variáveis: camelCase.
  - Arquivos de Rotas: `page.tsx`, `layout.tsx`.
