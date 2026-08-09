---
name: css-modules-styling
description: Стилизуй React-компоненты с использованием CSS Modules в соответствии с соглашениями проекта. Используй при добавлении стилей или работе со стилизацией компонентов.
---

# Стилизация с помощью CSS Modules

Стилизуй компоненты с использованием CSS Modules в соответствии с соглашениями проекта.

## Когда использовать этот навык

Используй, когда:
- Добавляешь стили к компонентам
- Создаёшь новые стилизованные компоненты
- Рефакторишь стили компонентов
- Пользователь упоминает стили, CSS или визуальный дизайн

## Именование файлов

**Всегда именуй файлы стилей**: `styles.module.css`

Файл должен называться ровно `styles.module.css` - вариации не допускаются.

## Паттерн импорта

**Всегда используй этот паттерн импорта**:

```typescript
import css from './styles.module.css';
```

Используй `css` в качестве имени импорта последовательно во всех компонентах. Не используйте другие имена импорта, такие как `styles`, `buttonStyles`, и т.д.

## Соглашения по именованию классов

**Внутри CSS-файла (`styles.module.css`)**: Используй **camelCcase**

```css
/* styles.module.css */
.button { }
.buttonPrimary { }
.cardContainer { }
.iconLarge { }
```

**В TypeScript-компоненте**: Используй **camelCase**

```tsx
// Component
import css from './styles.module.css';

export const Button = () => {
  return <button className={css.buttonPrimary}>Click</button>;
};
```

## CSS-переменные

**Старайся** использовать CSS-переменные**

Переменные определены в файле `src/app/styles/theme.css`


```css
/* ✅ Хорошо — использование существующих CSS-переменных src/app/styles/f7-theme.css */
.button {
  color: var(--color-primary);
  padding: var(--spacing-medium);
  font-size: var(--font-size-base);
}
```

```tsx
/* ✅ Хорошо — использование динамических CSS-переменных из react компонента */
// QrContainer.tsx
<div className={css.qrContainer} style={{'--qr-size': `${QR_WIDTH}px`} as CSSProperties}></div>

// styles.module.css
.qr-container {
  width: var(--qr-size);
  height: var(--qr-size);
}
```

```css
/* ❌ Плохо — создание новых переменных */
.button {
  --my-custom-color: #007bff;
  color: var(--my-custom-color);
}
```

## Использование классов в TypeScript

**Один класс**
```tsx
<div className={css.container}>
```

**Несколько классов** - используй `clsx`
```tsx
import clsx from 'clsx';

<button className={clsx(
  css.button,
  {[css.buttonPrimary]: isPrimary}
)}>
```

## Чек-лист

Перед завершением стилизации:
- [ ] Файл назван точно `styles.module.css`
- [ ] Импорт использует `import css from './styles.module.css';`
- [ ] Все CSS-классы используют camel-case
- [ ] Используется с `clsx` для условных классов при необходимости
