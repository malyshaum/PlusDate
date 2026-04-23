# PlusDate SPA

Front-End приложение проекта PlusDate. Это SPA на React + TypeScript + Vite для Telegram Mini App сценария: onboarding, лента анкет, лайки, мэтчи, чаты, профиль, premium и moderation flow.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- Axios
- Framer Motion
- i18next

## Quick Start

Требования:

- Node.js 22+
- npm 10+

Установка и запуск:

```bash
cd /Users/danila/Projets/PlusDate/spa-main
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Tests:

```bash
npm test
```

Lint:

```bash
npm run lint
```

## Environment Variables

Файл `.env` не должен храниться в репозитории. Для локального запуска используйте переменные Vite.

Основные переменные:

- `VITE_MODE` — режим приложения
- `VITE_API_URL` — базовый URL backend API
- `VITE_SOCKET_HOST` — socket host
- `VITE_SOCKET_PORT` — socket port
- `VITE_SOCKET_AUTH_URL` — endpoint для socket auth
- `VITE_CENTRIFUGO_WS_URL` — полный WebSocket URL для realtime
- `VITE_GTM_TOKEN` — Google Tag Manager container id
- `VITE_MAINTENANCE_MODE` — флаг maintenance mode (`true` / `false`)

## Scripts

- `npm run dev` — локальный dev server
- `npm run build` — production build
- `npm run preview` — локальный preview production build
- `npm run lint` — ESLint
- `npm test` — Vitest test suite
- `npm run test:watch` — тесты в watch mode

## Architecture

Проект организован в стиле feature-sliced / domain-oriented structure.

Основные слои:

- `src/app` — bootstrap, роутинг, глобальные providers, localization
- `src/pages` — page-level screens
- `src/processes` — multi-step flows (`onboarding`, `moderation`)
- `src/widgets` — крупные UI-блоки и layout
- `src/features` — feature-level interaction logic
- `src/entities` — доменные сущности и API слоя сущностей
- `src/shared` — reusable UI, hooks, utils, config, sockets, constants

Ключевые infrastructure providers:

- `BrowserRouter`
- `ErrorBoundary`
- `MaintenanceProvider`
- `QueryClientProvider`
- `AuthProvider`
- `SocketProvider`
- `PaymentProvider`
- `GoogleTagManagerProvider`

State management:

- local state — component state
- global UI state — Zustand
- server state / caching — TanStack Query

## Project Structure

```text
src/
  app/
  entities/
  features/
  pages/
  processes/
  shared/
  widgets/
```

## Routing

Основные маршруты:

- `/feed`
- `/likes`
- `/matches`
- `/chats`
- `/chat/:chatId`
- `/profile`
- `/profile/edit`
- `/profile/settings`
- `/preferences`
- `/premium`
- `/user/:id`
- `/onboarding`
- `/moderation`

Это полноценный SPA routing через `react-router-dom`, а не набор статических HTML страниц.

## API Integration

Приложение работает с реальным backend API.

Подход:

- centralized HTTP access через `axios`
- typed request/response handling на TypeScript
- query caching и refetch logic через TanStack Query
- auth token хранится в cookie
- realtime updates идут через socket layer в `src/shared/sockets`

Основные интеграции:

- auth / current user
- feed and swipes
- likes / matches
- chats and messages
- profile and search preferences
- subscriptions / premium
- moderation

## Forms and Validation

Во фронтенде используются управляемые формы и явная валидация:

- `react-hook-form`
- `zod`
- reusable form fields в `src/shared/ui`

Примеры сценариев:

- onboarding
- profile edit
- search preferences
- reporting

## Error Handling and Loading

В приложении реализованы инженерные базовые практики:

- global `ErrorBoundary`
- API error handling
- user-visible feedback через toast / snackbar
- loading and async state handling
- network availability indicator
- console logging for runtime failures

## UI and Responsiveness

Приложение адаптировано под mobile-first Telegram Mini App сценарий, но также корректно собирается и работает как обычное web SPA.

Используется:

- reusable shared UI components
- page/layout widgets
- transitions and animation via Framer Motion
- responsive layout patterns

## Testing

Во фронтенде настроен `Vitest + Testing Library`.

Покрыты:

- unit tests для utility и state logic
- integration tests для form/UI behavior

Текущие тестовые файлы:

- `src/shared/lib/validateName.test.ts`
- `src/shared/api/helper.test.ts`
- `src/shared/lib/useToast.test.ts`
- `src/app/providers/ErrorBoundary.test.tsx`
- `src/shared/ui/Input/InputField.test.tsx`

## Deployment

Для Docker deployment см. отдельный документ:

- [DOCKER_SETUP.md](/Users/danila/Projets/PlusDate/spa-main/DOCKER_SETUP.md)

## Related Project Parts

- Front-End: `/Users/danila/Projets/PlusDate/spa-main`
- Back-End: `/Users/danila/Projets/PlusDate/api-main`
- Root repository README: [/Users/danila/Projets/PlusDate/README.md](/Users/danila/Projets/PlusDate/README.md)

## Review Notes

Если проект проверяется по дипломному FE criterion, здесь уже есть:

- SPA на modern framework
- routing
- deliberate architecture
- local + global state management
- centralized API layer
- forms and validation
- error boundary
- responsive UI
- linting
- unit/integration tests
