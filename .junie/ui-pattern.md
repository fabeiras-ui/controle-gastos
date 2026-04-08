# 🎨 UI Pattern & Estilização

## Tailwind CSS v4
- **CSS-First:** Não procure por `tailwind.config.js`. Novas cores e tokens devem ser adicionados ao `@theme` no `src/app/globals.css`.
- **Utilitários:** Use a função `cn()` de `@/lib/utils` para mesclar classes Tailwind.

## Componentes (Shadcn + Base UI)
- **Base UI Primitives:** Todos os componentes de UI devem usar `@base-ui/react` como base.
- **CVA:** Gerencie variantes de componentes (cores, tamanhos) usando `class-variance-authority`.
- **Slots:** Utilize o atributo `data-slot` para identificar partes internas dos componentes (ex: `data-slot="button"`).
