---
name: frontend-best-practices
description: Применяй паттерны проектирования ПО, принципы SOLID и современные лучшие практики фронтенда. Используй при решении сложных задач, рефакторинге кода или принятии архитектурных решений.
---

# Лучшие практики фронтенда

Применяй паттерны проектирования ПО и лучшие практики как Senior Frontend Developer.

## Когда использовать этот навык

Используй, когда:

- Решаешь сложные задачи фронтенда
- Принимаешь архитектурные решения
- Проводишь рефакторинг существующего кода
- Проектируешь новые функции или модули
- Пользователь спрашивает о лучших практиках или чистом коде

## Основные принципы

### Принципы SOLID для фронтенда

**Принцип единственной ответственности (SRP)**
Каждый компонент/функция должен делать одну вещь хорошо.

```tsx
// ✅ Хорошо — единая ответственность, без FC, с JSDoc
type Props = {
    user: User;
};

/**
 * Отображает аватар пользователя
 */
export const UserAvatar = ({user}: UserAvatarProps) => {
    return <img src={user.avatar} alt={user.name}/>;
};

type Props = {
    user: User;
};

/**
 * Отображает имя пользователя
 */
export const UserName = ({user}: UserNameProps) => {
    return <span>{user.name}</span>;
};

type Props = {
    user: User;
};

/**
 * Компонент профиля пользователя, объединяющий аватар и имя
 */
export const UserProfile = ({user}: UserProfileProps) => {
    return (
        <div>
            <UserAvatar user={user}/>
            <UserName user={user}/>
        </div>
    );
};

// ❌ Плохо — слишком много ответственностей, используется FC
export const User: FC = () => {
    // Загрузка данных
    const [user, setUser] = useState(null);
    useEffect(() => {
        fetchUser();
    }, []);

    // Форматирование
    const formatName = () => { ...
    };

    // Отрисовка нескольких сущностей
    return (
        <div>
            <img src={user.avatar}/>
            <span>{formatName()}</span>
            <button onClick={updateUser}>Update</button>
            <form onSubmit={handleSubmit}>...</form>
        </div>
    );
};
```

**Принцип открытости/закрытости (OCP)**
Компоненты должны быть открыты для расширения, закрыты для изменения.

```tsx
// ✅ Хорошо — расширяем через пропсы, без FC, с JSDoc
type Props = {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    icon?: ReactNode;
    children: ReactNode;
};

/**
 * Универсальный компонент кнопки с поддержкой различных вариантов и размеров
 */
export const Button = ({
                           variant = 'primary',
                           size = 'medium',
                           icon,
                           children
                       }: ButtonProps) => {
    const handleClick = () => {
        // Логика обработчика
    };

    return (
        <button
            className={clsx(styles.button, styles[variant], styles[size])}
            onClick={handleClick}
        >
            {icon && <span className={styles.icon}>{icon}</span>}
            {children}
        </button>
    );
};

// Использование — расширено без изменения
<Button variant="danger" size="large" icon={<TrashIcon/>}>
    Delete
</Button>

// ❌ Плохо — нужно изменять компонент для новых вариантов, используется FC
const Button: FC = ({children}) => {
    return <button className="blue-button">{children}</button>;
};
```

**Принцип инверсии зависимостей (DIP)**
Зависит от абстракций, а не от конкретных реализаций.

```tsx
// ✅ Хорошо — зависит от абстракции (типа)
type DataFetcher = {
    fetch: (id: string) => Promise<Data>;
};

const useData = (fetcher: DataFetcher, id: string) => {
    const [data, setData] = useState<Data | null>(null);

    useEffect(() => {
        fetcher.fetch(id).then(setData);
    }, [fetcher, id]);

    return data;
};

// Можно внедрять разные реализации
const apiFetcher: DataFetcher = {
    fetch: (id) => axios.get(`/api/data/${id}`).then(r => r.data),
};

const mockFetcher: DataFetcher = {
    fetch: (id) => Promise.resolve(mockData[id]),
};

// ❌ Плохо — жёсткая привязка к axios
const useData = (id: string) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get(`/api/data/${id}`).then(r => setData(r.data));
    }, [id]);

    return data;
};
```

**Паттерн Custom Hook**

```typescript
// ✅ Хорошо — выноси сложную логику в переиспользуемые хуки
// Избегай избыточной мемоизации — используй только когда нужно
export const useCardSelection = (cards: Card[]) => {
    const [selected, setSelected] = useState<string | null>(null);

    const select = (id: string) => {
        setSelected(id);
    };

    const deselect = () => {
        setSelected(null);
    };

    // Производное состояние — не нужен useMemo для простого поиска
    const selectedCard = cards.find(c => c.id === selected);

    return {selected, selectedCard, select, deselect};
};

// Использование
type CardListProps = {
    cards: Card[];
};

/**
 * Отображает список карт с функциональностью выбора
 */
export const CardList = ({cards}: CardListProps) => {
    const {selected, select} = useCardSelection(cards);

    return <div>
...
    </div>;
};

// ❌ Плохо — избыточная мемоизация
export const useCardSelection = (cards: Card[]) => {
    const [selected, setSelected] = useState<string | null>(null);

    const select = useCallback((id: string) => {
        setSelected(id);
    }, []);

    const selectedCard = useMemo(
        () => cards.find(c => c.id === selected),
        [cards, selected]
    );

    return {selected, selectedCard, select};
};
```

## Принципы качества кода

### DRY (Don't Repeat Yourself)

```tsx
// ✅ Хорошо — вынеси общую логику, без FC
const useFormField = (name: string, initialValue: string) => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState('');

    const validate = () => {
        if (!value) {
            setError('Required');
            return false;
        }
        setError('');
        return true;
    };

    return {value, setValue, error, validate};
};

// Использование
type Props = {};

/**
 * Форма для ввода данных карты
 */
export const CardForm = ({}: CardFormProps) => {
    const cardNumber = useFormField('cardNumber', '');
    const cvv = useFormField('cvv', '');

    const handleSubmit = () => {
        if (cardNumber.validate() && cvv.validate()) {
            // Отправка
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Поля формы */}
        </form>
    );
};

// ❌ Плохо — повторяющийся код, используется FC
const CardForm: FC = () => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardNumberError, setCardNumberError] = useState('');

    const [cvv, setCvv] = useState('');
    const [cvvError, setCvvError] = useState('');

    // Повторяющаяся логика валидации
    const validateCardNumber = () => {
        if (!cardNumber) {
            setCardNumberError('Required');
            return false;
        }
        return true;
    };

    const validateCvv = () => {
        if (!cvv) {
            setCvvError('Required');
            return false;
        }
        return true;
    };
};
```

### KISS (Keep It Simple, Stupid)

```typescript
// ✅ Хорошо — просто и понятно
const isCardValid = (card: Card): boolean => {
    return card.number.length === 16 && card.cvv.length === 3;
};

// ❌ Плохо — переусложнено
const isCardValid = (card: Card): boolean => {
    const numberValidator = new CardNumberValidator();
    const cvvValidator = new CVVValidator();

    return (
        numberValidator.validate(card.number).isValid &&
        cvvValidator.validate(card.cvv).isValid
    );
};
```

### YAGNI (You Aren't Gonna Need It)

```typescript
// ✅ Хорошо — реализуй только то, что нужно сейчас, используя type
import {PropsWithChildren} from "react";

type ButtonProps = PropsWithChildren<{
    onClick: () => void;
}>;

// ❌ Плохо — преждевременная абстракция для "будущих функций"
type ButtonProps = {
    onClick?: () => void;
    onDoubleClick?: () => void;
    onLongPress?: () => void;
    onHover?: () => void;
    tooltip?: string;
    badge?: number;
    animation?: 'pulse' | 'bounce' | 'shake';
    // ... ещё 20 пропсов, которые могут понадобиться когда-нибудь
};
```

## Типобезопасность

**Строгая типизация**

```typescript
// ✅ Хорошо — строгие типы, используется type (не interface) для пропсов
type Card = {
    id: string;
    number: string;
    cvv: string;
    expiry: Date;
    holder: string;
};

type Props = {
    card: Card;
    onSelect: (id: string) => void;
};

/**
 * Отображает информацию о карте с возможностью выбора
 */
export const Card = ({card, onSelect}: CardProps) => {
    const handleClick = () => {
        onSelect(card.id);
    };

    return (
        <div onClick = {handleClick} >
            {/* Содержимое карты */}
            < /div>
    );
};

// ❌ Плохо — слабые типы, используется interface, используется FC
interface CardProps {
    card: Card;
    onSelect: (id: string) => void;
}

const Card: FC<CardProps> = ({card, onSelect}) => { ...
};

// ❌ Плохо — тип any
const Card = ({card, onSelect}: any) => { ...
};
```

**Type guards**

```typescript
const isCard = (value: unknown): value is Card => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'number' in value
    );
};

// Использование
const processData = (data: unknown) => {
    if (isCard(data)) {
        // здесь data имеет тип Card
        console.log(data.number);
    }
};
```

## Доступность

**Семантический HTML**

```tsx
// ✅ Хорошо — семантический HTML, вынесенные обработчики
type SubmitButtonProps = {
    onClick: () => void;
};

/**
 * Кнопка отправки формы
 */
export const SubmitButton = ({onClick}: SubmitButtonProps) => {
    const handleClick = () => {
        onClick();
    };

    return <button onClick={handleClick}>Submit</button>;
};

// ✅ Хорошо — семантическая навигация
type NavigationProps = {
    items: NavItem[];
};

export const Navigation = ({items}: NavigationProps) => {
    return (
        <nav>
            {items.map(item => (
                <a key={item.id} href={item.href}>{item.label}</a>
            ))}
        </nav>
    );
};

// ❌ Плохо — div-ы с onClick
export const SubmitButton = ({onClick}: SubmitButtonProps) => {
    return <div onClick={onClick}>Submit</div>;
};
```

**ARIA-атрибуты**

```tsx
// ✅ Хорошо — правильные ARIA-атрибуты, вынесенные обработчики
type CloseButtonProps = {
    onClick: () => void;
    isActive: boolean;
};

/**
 * Кнопка закрытия диалога с поддержкой ARIA-атрибутов
 */
export const CloseButton = ({onClick, isActive}: CloseButtonProps) => {
    const handleClick = () => {
        onClick();
    };

    return (
        <button
            aria-label="Close dialog"
            aria-pressed={isActive}
            onClick={handleClick}
        >
            <CloseIcon/>
        </button>
    );
};
```

## Тестирование

Тесты — Vitest. Файлы тестов называют **`*.spec.ts` / `*.spec.tsx`** (не `*.test.*`)
и кладут в каталог `__tests__/` рядом с тестируемым модулем:

```
components/Button/
  index.tsx
  __tests__/Button.spec.tsx
```

Запуск: `pnpm run test`.

## Чек-лист

Перед завершением фичи:

- [ ] Избегай избыточной мемоизации — только при доказанной необходимости
- [ ] Единственная ответственность — каждый компонент/функция делает одну вещь
- [ ] Нет дублирования кода (DRY)
- [ ] Простое решение, не переусложнённое (KISS, YAGNI)
- [ ] Правильные абстракции (DIP)
- [ ] Типобезопасность (без `any`)
- [ ] Доступность (семантический HTML, ARIA)
- [ ] Тесты в `__tests__/`, файлы названы `*.spec.ts(x)`
- [ ] Учтена производительность (мемоизация только когда нужно, ленивая загрузка)
- [ ] Код читаемый и поддерживаемый
