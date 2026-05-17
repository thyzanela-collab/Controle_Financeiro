# Controle Financeiro

App mobile para motoristas de aplicativo rastrearem ganhos, gastos, KM rodados e horas trabalhadas por dia.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — roda o app Expo (via workflow)
- `pnpm --filter @workspace/mobile run typecheck` — verificação de tipos
- `pnpm --filter @workspace/api-server run dev` — roda o servidor de API (porta 5000)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo / React Native (Expo Router v6)
- Persistência: AsyncStorage (`@controle_financeiro_v2`)
- UI: tema escuro fixo, paleta amarela (#FACC15)
- API: Express 5 + Drizzle ORM + PostgreSQL

## Where things live

- `artifacts/mobile/context/AppContext.tsx` — estado global, modelo de dados
- `artifacts/mobile/app/(tabs)/` — todas as telas (index, ganhos, gastos, relatorios, config)
- `artifacts/mobile/app/(tabs)/_layout.tsx` — tab bar flutuante (pill)
- `artifacts/mobile/app/_layout.tsx` — root layout com AppProvider

## Architecture decisions

- Cada entrada (ganho, gasto, KM, hora) é salva com `date: YYYY-MM-DD` e `time` — tela home filtra por hoje automaticamente, relatórios usam o histórico completo
- AsyncStorage key `@controle_financeiro_v2` — separada de qualquer dado legado
- `platformConfirm()` usa `window.confirm` no web e `Alert.alert` no nativo (imports estáticos, nunca `require()` dinâmico)
- AppProvider retorna `null` enquanto carrega do storage para evitar estado vazio piscando

## Product

- **Home**: Lucro líquido do dia, progresso da meta, Horas Trabalhadas e KM Rodados com CRUD inline
- **Ganhos**: registro por modalidade — Uber/99, Particular, Gorjeta (add/edit/delete)
- **Gastos**: categorias — Combustível, Alimentação, Pedágio, Outros (add/edit/delete)
- **Relatórios**: resumo de hoje, gráfico de barras dos últimos 7 dias, breakdown por modalidade de ganho e por categoria de gasto
- **Config**: nome do motorista, meta diária, apagar todos os dados

## User preferences

- Tema escuro fixo, sem modo claro
- Paleta: BG #000, CARD #18181B, BORDER #27272A, MUTED #71717A, YELLOW #FACC15
- Português brasileiro em toda a interface
- Sem "Ações Rápidas" e sem contagem de corridas

## Gotchas

- Nunca usar `require()` dinâmico dentro de funções — o Metro bundler causa tela branca. Sempre importar no topo do arquivo.
- `pnpm run dev` na raiz não funciona — usar `restart_workflow` ou o painel de workflows
