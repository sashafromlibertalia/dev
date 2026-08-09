Этот файл содержит рекомендации при работе с кодом данного проекта

## Описание проекта

SPA приложение, работающее в Web. Использует React 19, react-query, TypeScript (строгий режим), CSS Modules и React
Intl.

**Технологический стек**: React 19, TypeScript, CSS Modules, React Intl, Vite, @tanstack/react-query, react-hook-form,
zod, axios, dayjs.

## Основные команды

### Разработка

```bash
pnpm install                     # Установка зависимостей
pnpm run dev                     # Dev сервер с HMR
```

### Build & Production

```bash
pnpm run build                   # Сборка для продакшена
```

### Testing

```bash
pnpm run test                    # Запуск тестов (Vitest, jsdom)
```

Конфиг Vitest — прямо в `vite.config.ts`
(`test: { environment: 'jsdom', globals: true, setupFiles: './vitest/setup.ts' }`). Глобалы Vitest и
`@testing-library/jest-dom` подключены через `types` в `tsconfig.json`, импортировать `describe`/`it`/`expect`/`render`
в тестах не нужно.

**Test files**: `*.spec.tsx` или `*.spec.ts` в каталогах `__tests__/`, расположенных рядом с исходными файлами
тестируемого модуля.

### Linting

```bash
pnpm run lint                    # Полная проверка линтером (eslint)
pnpm run lint:fix                # Автоматическое исправление всех ошибок линтера
```

## Архитектура

### Структура директорий

```
src/
├── app/                           # Конфигурация приложения — роуты, библиотеки, стили, подключение контекстов и т.д.
│   ├── config/                    # routes, sentry, unleash
│   ├── views/                     # Общие экраны приложения (например, InitDataError)
│   ├── styles/                    # Глобальные стили
│   ├── IntlAppProvider.tsx        # Провайдер React Intl
│   ├── UnleashUserContext.tsx     # Контекст feature flags
│   └── ErrorBoundary.tsx
├── declarations/                  # d.ts типы для глобальных сущностей и библиотек (vite-env.d.ts, window.d.ts)
├── domains/                       # Доменные модели и бизнес-логика, специфичная для определённых областей приложения
│   └── <domain>/                  # Домен
│       ├── entities/              # Сущности, представляющие ключевые объекты домена (например, User, GameSession и т.д.)
│       ├── features/              # Бизнес-логика приложения, напрямую влияющая на его данные (например, методы идентификации, игровые механики и т.д.)
│       ├── pages/                 # Страницы приложения, связанные с данным доменом
│       └── shared/                # Общие компоненты, хуки и утилиты, используемые внутри домена
├── layout/                        # Макеты страниц и общие компоненты для них
├── shared/                        # Общее для всего приложения
│   ├── api/                       # URL-ы, типы запросов/ответов, QueryKeysEnum, конфигурация axios-клиентов (api/authApi)
│   ├── components/                # Общие компоненты, не привязанные ни к какому домену
│   ├── hooks/                     # Общие хуки (useAuthQuery, инициализация сервисов, общая логика)
│   ├── lib/                       # Утилиты
│   ├── routes/                    # Конфигурация роутов для приложения, разбитая на домены
│   ├── factories/                 # Фабрики (моки/данные для тестов и др.)
│   ├── metrics/                   # Аналитика/метрики
│   ├── props/                     # Общие типы пропсов
│   └── testing/                   # Хелперы для тестов
├── init.ts                        # Инициализация утилит и вспомогательных функций, специфичных только для Telegram Mini Apps
├── main.tsx                       # Точка входа приложения
└── mockEnv.ts                     # Утилита для мокирования окружения Telegram Mini Apps в dev режиме
```

### Паттерн клиентских модулей (React)

Пример модуля: `src/domains/player/`

```
src/
└── domains/
    └── player/
        └── entities/
            ├── Task/
            │   └── components/
            │       └── Card/
            │           └── index.tsx
            │           └── styles.module.css
            features/
            ├── my-feature
            │   └── index.tsx
            │   └── styles.module.css
            │   └── validation.css
            pages/
            ├── ExamplePage
            │   └── index.tsx
            │   └── styles.module.css
            shared/
            ├── hooks/
            │   ├── useTasks.ts
            ├── constants.ts            
```

### Серверное состояние (react-query)

Клиентские модули используют @tanstack/react-query для хранения серверного состояния в кэше; в иных случаях используется
react context.
`QueryClient` создаётся в `src/shared/api/index.ts` (дефолты: `retry: 3`, `refetchOnMount: false`,
`refetchOnWindowFocus: false`). Каждый хук на основе react-query должен быть обёрнут в кастомный хук `useAuthQuery`
(`src/shared/hooks/useAuthQuery.ts`; он полностью повторяет контракт `useQuery`)
— он автоматически включает запрос только при наличии токена и подставляет `Authorization` в заголовки. Например:

```ts
export const useProfileData = () => {
    return useAuthQuery({
        queryFn: async () => {
            // Логика запроса    
        },
        queryKey: [QueryKeysEnum.ProfileData]
    });
};
```

Каждый хук на основе react-query должен иметь свой queryKey, который должен быть описан в enum `QueryKeysEnum`
(`src/shared/api/index.ts`)

### HTTP-клиент (axios)

Два инстанса в `src/shared/api/index.ts`:

- `api` — основной клиент для авторизованных запросов;
- `authApi` — для запросов аутентификации.

Интерсепторы `api`:

- при `timeout` один раз перезагружают страницу (часто ложный таймаут после простоя вкладки), затем показывают
  `TimeoutModal`;
- при `401` пытаются однократно обновить токен через `refreshAccessToken()` (refresh по httpOnly-куке) и переотправляют
  запрос; если токен невалиден (refresh missing/revoked/expired) — чистят токен и редиректят на логин
  (`SessionExpiredModal` в TMA).

### Роутинг

- **Клиентские роуты**: Определены в `src/shared/routes/`
- **API роуты**: Определены в `src/shared/api/service.ts`

### Стилизация

- **CSS модули**: `styles.module.css` рядом с react компонентами
- **Именование классов**: camelCase в CSS (например, `.cardInfo`), импортируются как `css.cardInfo`
- **Паттерн импорта**: `import css from './styles.module.css'` (всегда используй `css` в качестве названия импорта)
- **Соглашения**: Если работаешь со стилизацией, для получения развёрнутых описаний и детальных примеров используй скилл
  `css-modules-styling`

### i18n (Интернационализация)

- **Система**: React Intl (FormatJS)
- **Файлы переводов**: `_.i18n/{ru,en,es,zh}.js` рядом с компонентами (`en.js` — источник); собираются плагином
  `@builtbysasha/vite-plugin-i18n`
- **Формат**: `export default { 'component-name': { 'key': 'Text' } }` (ESM-модуль)
- **Паттерн**: `<FormattedMessage>` — для текста внутри разметки; `useIntl()` → `intl.formatMessage` — для строковых
  контекстов (атрибуты `label`/`placeholder`, сообщения об ошибках, `confirm()` и т.п.)
- **Соглашения**: Смотри скилл `i18n-setup` для детальных примеров

## Документация фич

Каждая фича фронта живёт в `src/domains/<домен>/features/<x>/` и имеет собственный `README.md` (назначение, точка входа,
API/данные, ключевые файлы, нюансы). Сводный индекс всех фич — [`docs/domains-index.md`](docs/domains-index.md),
сгруппирован по доменам.

**ЖЁСТКОЕ ПРАВИЛО:**

- Меняешь код фичи → обнови её `README.md` в **том же** изменении.
- Создаёшь новую фичу `features/<x>/` → сразу заведи `README.md` и добавь строку в [
  `docs/domains-index.md`](docs/domains-index.md).

## Конфигурация

### TypeScript

- **Конфигурация**: `tsconfig.json` (строгий режим с декораторами)
- **Строгие проверки**: `strict` включён (включая `strictNullChecks`), `noUnusedLocals`, `noUnusedParameters`;
  `noImplicitAny` явно отключён
- **Декораторы**: `experimentalDecorators`, `emitDecoratorMetadata`
- **Модули**: `ESNext`, `moduleResolution: bundler`, `target: ES2022`
- **JSX**: `react-jsx` (автоматический runtime)

### ESLint

- **Конфиг**: flat config (`eslint.config.js`), `typescript-eslint` + `eslint-plugin-react`
- **Правила**: indent 4, `semi` always, `object-curly-spacing` always; из React — `jsx-curly-brace-presence`,
  `jsx-wrap-multilines`; `react/react-in-jsx-scope` off
- **Кэш**: `.eslintcache` (в .gitignore)

## Соглашения по коду

### Именование файлов

- **Компоненты**: `index.tsx` (на основе папок)
  ```
  components/Button/index.tsx
  components/Button/types.ts
  components/Button/constants.ts
  components/Button/styles.module.css
  components/Button/__tests__/Button.spec.tsx
  ```
- **Утилиты/Сервисы**: camelCase.ts
- **Типы**: `types.ts`
- **Константы**: `constants.ts`
- **Хуки**: `use<Name>.ts` (например, `useCardData.ts`)

### TypeScript

- **Без `any`**: Используй правильные типы, `unknown` для действительно неизвестных типов
- **Строгие проверки null**: Всегда обрабатывай `null`/`undefined`
- **Enum-ы**: Предпочитайте строковые литеральные объединения вместо enum-ов, когда возможно
- **Соглашения**: Смотри скилл `typescript-patterns` для детального описания и конкретных примеров

### React

- **Компоненты**: Функциональные компоненты с хуками (без классовых компонентов)
- **Props**: Явные TypeScript-интерфейсы (например, `Props`)
- **Состояние**: Локальное состояние (`useState`) или react-context для общего состояния
- **Соглашения**: Смотри скилл `react-components` для детальных примеров

## Скиллы (.claude/skills/)

Проектные скиллы загружаются через skill tool. Используй их для специализированных задач вместо того, чтобы выводить
паттерны из контекста вручную:

| Скилл                     | Когда применять                                                                                                                                                               |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `typescript-patterns`     | Определение типов, работа с TS, исправление ошибок типов (строгий режим, type vs interface, дискриминированные объединения, служебные типы, интеграция типов бэкенда)         |
| `react-components`        | Создание и рефакторинг React-компонентов, хуков, UI-элементов (функциональные компоненты + хуки, декомпозиция)                                                                |
| `css-modules-styling`     | Добавление стилей, работа со стилизацией компонентов (`styles.module.css`, импорт `css`, camelCase-классы)                                                                    |
| `i18n-setup`              | Добавление пользовательского текста и переводов (React Intl + папки `_.i18n/`), выбор `<FormattedMessage>` vs `intl.formatMessage`                                            |
| `translate`               | Добавление новой локали/языка в проект («переведи на немецкий», «добавь французскую локаль», генерация `*.js` из `en.js`)                                                     |
| `frontend-best-practices` | Сложные задачи, рефакторинг, архитектурные решения (паттерны проектирования, SOLID, лучшие практики фронтенда)                                                                |
| `poker-skin`              | Добавление нового скина/темы/бренда приложения TonPoker (по образцу TON/Solana), поддержка новой сети, white-label. Триггеры: «новый скин», «добавь тему», «ребрендинг под Y» |
| `bug`                     | Сообщения о багах от QA: описание проблемы → поиск причины → фикc → GitLab MR. Триггеры: «баг», «не работает», «сломалось», «ошибка»                                          |
| `fullstack-feature`       | Сквозная фича через бекенд (Go) и фронтенд (React) одним процессом, чтобы API-контракт не разошёлся. Триггеры: «фича целиком», «и на беке и на фронте», `/fullstack-feature`  |

## Частые подводные камни

1. **CSS Modules**: Всегда используй именование `styles.module.css` и импортируй как `css`
   (`import css from './styles.module.css'`)
2. **Строгий режим TypeScript**: Нельзя присваивать `null` ненулевым типам, обрабатывай явно
3. **pnpm**: Всегда используйте pnpm, никогда npm или yarn
