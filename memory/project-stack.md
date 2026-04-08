---
name: project-stack
description: Stack e estrutura do projeto Vault (controle de gastos)
type: project
---

## Stack Principal
- **Frontend:** Next.js 16.1.1 + React 19.2.3 + TypeScript
- **Estilização:** Tailwind CSS 4 + Radix UI + Shadcn/ui
- **Autenticação:** NextAuth.js 4.24.13 (email/senha + Google OAuth)
- **Banco de Dados:** Prisma 6.1.0 + SQLite (dev.db)
- **Real-time:** Liveblocks 3.12.1 (live cursors)
- **Forms:** React Hook Form + Zod
- **UI Components:** Shadcn/ui + Radix UI

## Estrutura do Projeto
- `src/app/page.tsx` - Página principal de login
- `src/components/` - Componentes UI
- `prisma/` - Configuração do banco de dados
- `public/` - Arquivos estáticos

## Funcionalidades Atuais
- Sistema de autenticação (email + Google)
- Dashboard após login
- Página de cadastro
- Live cursors para colaboração
- Controle de gastos (nome do projeto: Vault)

## Contexto
Projeto de controle financeiro pessoal com recursos de colaboração em tempo real. Versão atual: 0.1.0