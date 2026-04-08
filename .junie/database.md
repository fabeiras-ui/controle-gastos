# 🗄️ Gestão de Banco de Dados (SQLite + Prisma)

## Comandos Críticos
- **NUNCA use `npx prisma db push`:** Este comando pode causar perda de dados sem rastreabilidade.
- **Sempre use `npx prisma migrate dev`:** Para criar histórico de migrações e aplicar alterações no schema.
- **Bloqueio de Reset:** Se uma migração exigir um "Reset" (limpeza de dados), **pare imediatamente e avise o Fábio**.

## Manutenção
- **Singleton core:** Não altere o arquivo `src/lib/prisma.ts`.
- **Prisma Studio:** Use `npx prisma studio` apenas para visualização.
- **Gerenciamento:** Sempre rode `npx prisma generate` após qualquer alteração no `schema.prisma`.
