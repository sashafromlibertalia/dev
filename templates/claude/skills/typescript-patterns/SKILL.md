---
name: typescript-patterns
description: Пиши TypeScript следуя соглашениям проекта — строгий режим, type vs interface, дискриминированные объединения, служебные типы, интеграция типов бэкенда. Используй при определении типов, работе с TypeScript или исправлении ошибок типов.
---

# Паттерны TypeScript

Пиши TypeScript следуя соглашениям проекта: строгий режим, явная типизация, специфичные для проекта паттерны для клиентского и серверного кода.

## Когда использовать этот навык

Используй когда:
- Определяешь новые типы или интерфейсы
- Исправляешь ошибки TypeScript
- Интегрируешь типы бэкенда в клиентский или серверный код
- Рефакторишь типы или улучшаешь безопасность типов

## Конфигурация

TypeScript настроен в `tsconfig.json` со строгим режимом. Ключевые настройки:

```json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports":true,
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "declaration": false,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": [],
    "noEmit": false,
    "jsx": "react-jsx",
    "noImplicitAny": false,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```
## Основные правила

### 1. `type` вместо `interface`

Всегда используй `type` для определений типов. `interface` допустим только для NestJS-специфичных реализаций (`CanActivate`, `PipeTransform`).

```typescript
// ✅ Хорошо — type для всего
type Props = {
  card: Card;
  onSelect: (id: string) => void;
};

type PaymentSystem = 'Visa' | 'MasterCard' | 'Mir';

type PreloadedState = {
  process: ProcessState;
  userInfo: UserInfoState;
};

// ❌ Плохо — interface
interface Props {
  card: Card;
  onSelect: (id: string) => void;
}
```

### 2. `import type` для типов

Всегда используй `import type` при импорте только типов. Требуется настройкой `isolatedModules: true` и улучшает оптимизацию бандла.

```typescript
// ✅ Хорошо
import type {Schemas} from '@backends/emit-gen';
import type {PipeTransform} from '@nestjs/common';
import type {Request} from 'express';
import type {PreloadedState} from '../../../../common/types';

// ✅ Хорошо — смешанный импорт (значения + типы)
import {Injectable} from '@nestjs/common';
import type {CanActivate, ExecutionContext} from '@nestjs/common';

// ❌ Плохо — обычный импорт для типов
import {Schemas} from '@backends/emit-gen';
import {PipeTransform} from '@nestjs/common';
```

### 3. Без `any`

Используй `unknown` для действительно неизвестных типов, никогда `any`.

```typescript
// ✅ Хорошо
const processData = (data: unknown) => {
  if (isCard(data)) {
    console.log(data.number);
  }
};

// ✅ Хорошо — type guard для unknown
const isCard = (value: unknown): value is Card => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'number' in value
  );
};

// ❌ Плохо
const processData = (data: any) => { ... };
```

### 4. Без расширений `.js` в импортах

При `moduleResolution: "nodenext"`, расширения `.js` НЕ нужны в импортах.

```typescript
// ✅ Хорошо
import {PaymentSystem} from '../common';
import type {Schemas} from '@backends/emit-gen';

// ❌ Плохо
import {PaymentSystem} from '../common.js';
```

### 5. Нет assert-ов типа (`as`) и non-null assert-ов (`!`)

Не используй `as` или `!` — они обходят безопасность типов и скрывают реальные ошибки. Используй type guards и явные проверки.

```typescript
// ❌ Плохо — assert типа скрывает небезопасное преобразование
const status = value as Status;

// ❌ Плохо — non-null assert может упасть в рантайме
const item = list.find(x => x.id === id)!;
process(userId!);

// ✅ Хорошо — явное сужение через type guard
const isStatus = (value: string): value is Status =>
  ['active', 'inactive'].includes(value);

if (isStatus(value)) {
  apply(value);
}

// ✅ Хорошо — явная проверка на null
if (!userId) {
  throw new Error('userId is required');
}
process(userId);
```

## Паттерны типов

### Строковые литеральные union-ы

Используй строкые литеральные union-ы вместо enum для простых наборов значений.

```typescript
// ✅ Хорошо — строковое литеральное объединение для простых типов
export type PaymentSystem = 'Visa' | 'MasterCard' | 'Mir';
export type DevicePlatform = 'Android' | 'iOS';
export type PromoPageView = 'short' | 'full';
export type Category = 'PlasticStandard';

// Инлайн в объектных типах
type Notification = {
  id: string;
  status: 'success' | 'error';
  messageKey: string;
};
```

### Enum

Используй enum когда значения используются как runtime значения (не только как типы) — в switch/case, сравнениях или массивах

```tsx
export enum ProcessStep {
  StepChecker = 'stepChecker',
  CardNumber = 'cardNumber',
  Authentication = 'authentication',
  PinCode = 'pinCode',
  Success = 'success',
  Error = 'error'
}

export enum FetchStatus {
  Initial = 'Initial',
  Loading = 'Loading',
  Complete = 'Complete',
  Error = 'Error'
}

// использование в switch/case оправдывает enum
switch (step) {
  case ProcessStep.Success:
    return <SuccessPage />;
  case ProcessStep.Error:
    return <ErrorPage />;
}
```

### Дискриминированные union-ы

Используй дискриминированные union-ы с литеральным полем-дискриминатором для состояний с разной формой данных.

```typescript
// ✅ Паттерн для PageData с состояниями error/success
type ErrorPageData = {
  isError: true;
  errorType: ProcessError;
};

type SuccessPageData = {
  isError: false;
  preloadedState: PreloadedState;
};

export type PageData = SuccessPageData | ErrorPageData;

// ✅ Паттерн для PreloadedState с разными страницами
type PreloadedErrorState = {
  page: 'error';
  errorReason: ErrorType;
  errorButtonUrl: string;
  platform: Platform;
};

type PreloadedSuccessState = {
  page: 'choose-card';
  viewCards: ViewCards;
  preSelectedPaymentSystem: PaymentSystem;
  cards: VirtualCard[];
  platform: Platform;
};

export type PreloadedState = PreloadedErrorState | PreloadedSuccessState;

// Использование — TypeScript сужает тип через дискриминатор
if (preloadedState.page === 'error') {
  // preloadedState: PreloadedErrorState
  return <ErrorPage reason={preloadedState.errorReason} />;
}
// preloadedState: PreloadedSuccessState
return <CardChooser cards={preloadedState.cards} />;
```

### Служебные типы

```typescript
// Record<Key, Value> для словарей
type Meta = Record<string, string>;
type Switcher = boolean | undefined;
type SwitcherMap = Record<string, Switcher>;

// Mapped types [key in Union] для типобезопасных отображений
// Гарантирует покрытие всех ключей PaymentSystem
type ViewCards = {
  paymentSystems: PaymentSystem[];
  designs: {
    [key in PaymentSystem]: string[];
  };
};

type ErrorTypesMap = {
  [key in ProcessError]: {
    title: string;
    subtitle: string;
    button: string;
    url: () => string;
  };
};

// Omit — удаление полей из типа
type InitActivationParams = Omit<Schemas['InitActivationByActivationTokenRequest'], 'type'>;

// NonNullable — удаление null/undefined
type DeliveryType = NonNullable<Schemas['IssuedCard']['deliveryInfo']>['deliveryType'];

// keyof + Omit для производных типов
type CardUserSettingsPermissions = keyof Omit<CardUserPermissions, 'creditLineType'>;

// Exclude — удаление вариантов из объединения
type ActivationError = Exclude<
  SomeBackendErrorResponse['code'],
  'NotEnoughMoneyForUnacceptencePayment'
> | 'Technical' | 'FetchingError';

// Индексный доступ [0] для типа элемента массива
type DeliveryOption = DeliveryOptionsResponse['deliveryOptions'][0];
```

### Type guards

Используй функции type guards вместо assert-ов типа для безопасного сужения неизвестных типов.

```typescript
// ✅ Хорошо — функция type guard
const isCard = (value: unknown): value is Card => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'number' in value
  );
};

// ✅ Type guard для Redux action в middleware
const isAsyncAction = (action: AnyAction): action is AsyncActionWithNotifications => {
  return typeof (action as AsyncActionWithNotifications).meta !== 'undefined';
};

// Использование
const processData = (data: unknown) => {
  if (isCard(data)) {
    // TypeScript знает: data is Card
    console.log(data.number);
  }
};
```

## Обработка null и undefined

```typescript
// ✅ Опциональные поля — используй ?
type VirtualCardPromoPreloadedState = {
  platform: Platform;
  tariffs: Tariffs;
  isUnauthorizedUser: boolean;
  topInformer?: Informer;  // может отсутствовать
};

// ✅ Явная проверка перед использованием
const handleSubmit = () => {
  if (!accountId) {
    return;
  }
  submit(accountId);  // TypeScript знает: accountId is string
};

// ✅ Nullish coalescing и optional chaining
const platform = userModel.platform ?? 'Android';
const tagName = userModel.tags?.find(t => t.type === 'main')?.name;

// ❌ Плохо — игнорирование возможного undefined
const platform = userModel.platform;
submit(platform);  // ошибка типа в строгом режиме
```

## Чек-лист

Перед завершением работы с типами:
- [ ] Использован `type`, не `interface`
- [ ] Все импорты типов используют `import type`
- [ ] Нет `any` — только конкретные типы или `unknown`
- [ ] Нет расширений `.js` в импортах
- [ ] Нет assert-ов типа `as` — используй type guards
- [ ] Нет non-null assert-ов `!` — используй явные проверки
- [ ] null/undefined обработаны явно через проверки или optional chaining
- [ ] Дискриминированные union-ы использованы для состояний с разной формой данных
- [ ] Mapped types `[key in Union]` использованы для типобезопасных отображений
