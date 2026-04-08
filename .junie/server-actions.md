# ⚡ Server Actions & Fluxo de Dados

## Arquitetura
- **Prefira Server Actions:** Evite criar APIs em `pages/api` ou `app/api`. Use Actions para mutações.
- **Localização:** Mantenha actions perto dos componentes ou em arquivos `actions.ts` dentro das pastas de rota.

## Validação e Erros
- **Zod:** Todo input de Action deve ser validado com schema Zod.
- **Tratamento de Erros:** Use blocos `try/catch` e retorne um objeto padronizado para a UI:
  ```typescript
  { success: boolean; message: string; data?: any; errors?: any }
  ```
- **Fetching:** Realize chamadas ao Prisma diretamente em Server Components sempre que possível.
