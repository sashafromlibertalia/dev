---
name: react-components
description: Создание React-компонентов согласно соглашениям проекта - функциональные компоненты с хуками, Redux Toolkit, правильная декомпозиция. Используй при создании или рефакторинге React-компонентов, хуков или UI-элементов.
---

# React-компоненты

Создавай React-компоненты в соответствии с архитектурой и лучшими практиками этого проекта.

## Когда использовать этот навык

Используй, когда:
- Создаёшь новые React-компоненты
- Рефакторишь существующие компоненты
- Создаёшь хуки или UI-элементы
- Пользователь упоминает React, компоненты или UI

## Основные принципы

**Только функциональные компоненты**
- Используй только функциональные компоненты (никогда классовые компоненты)
- Не используй типы `FC` или `FunctionComponent`
- Определяй типы props явно через `type` (не `interface`)
- Добавляй JSDoc-документацию для всех компонентов

```tsx
// ✅ Хорошо - функциональный компонент без FC с JSDoc
type Props = {
  cards: Card[];
  onSelect: (id: string) => void;
}

/**
 * Отображает список карт с функциональностью выбора
 */
export const CardList = ({ cards, onSelect }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  
  return (
    <div>
      {cards.map(card => (
        <CardItem key={card.id} card={card} onClick={onSelect} />
      ))}
    </div>
  );
};

// ❌ Плохо - использование типа FC
export const CardList: FC<Props> = ({ cards, onSelect }) => { ... }

// ❌ Плохо - классовый компонент
class CardList extends React.Component { ... }

// ❌ Плохо - отсутствуют типы
export const CardList = ({ cards, onSelect }: any) => { ... }
```

**Декомпозиция компонентов и разметки**
- Логически декомпозируй компоненты и разметку на более мелкие, сфокусированные части
- Каждый компонент должен иметь одну чёткую ответственность
- Разбивай сложный JSX на отдельные компоненты или переменные
- Выноси сложную условную логику за пределы JSX

```tsx
// ✅ Хорошо - декомпозированный компонент и разметка
// CardList/CardList.tsx
type Props = {
  cards: Card[];
};

/**
 * Отображает список карт
 */
export const CardList = ({ cards }: Props) => {
  return (
    <div>
      {cards.map(card => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
};

// CardList/CardItem/CardItem.tsx
type Props = {
  card: Card;
};

/**
 * Отображает отдельный элемент карты
 */
export const CardItem = ({ card }: Props) => {
  return (
    <div>
      <CardImage src={card.image} />
      <CardDetails card={card} />
    </div>
  );
};

// ✅ Хорошо - вынесенная условная логика
type Props = {
  status: CardStatus;
  isActive: boolean;
}

/**
 * Отображает статус карты с условным рендерингом
 */
export const CardStatus = ({ status, isActive }: Props) => {
  const statusText = isActive ? 'Active' : 'Inactive';
  
  if (status === 'pending') {
    return <div>Pending</div>;
  }
  
  return (
    <div>
      {statusText}
    </div>
  );
};

// ❌ Плохо - монолитный компонент
export const CardList = ({ cards }) => {
  return (
    <div>
      {cards.map(card => (
        <div>
          <img src={card.image} />
          <div>
            <h3>{card.name}</h3>
            <p>{card.description}</p>
            <button onClick={() => handleClick(card)}>Select</button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ❌ Плохо - множественные условия в JSX
export const CardStatus = ({ status, isActive }: Props) => {
  return (
    <div>
      {status === 'pending' ? (
        <div>Pending</div>
      ) : isActive ? (
        <div>Active</div>
      ) : (
        <div>Inactive</div>
      )}
    </div>
  );
};
```

## Файловая структура

```
ComponentName/
  index.tsx               # Главный файл компонента
  _.i18n/
    en.js                 # Переводы
    ru.js                 # Переводы
  SubComponent/           # Вложенные компоненты
    index.tsx
```

## Соглашения по именованию

**Файлы компонентов**: PascalCase
```
Button.tsx
CardList.tsx
UserProfile.tsx
```

**Файлы хуков**: camelCase с префиксом `use`
```
useCardData.ts
useFormValidation.ts
useAuthentication.ts
```

**Типы props**: Если компонентов в 1 файле несколько, то Имя компонента + суффикс `Props`. Иначе — просто `Props`
- Всегда используй `type` (не `interface`) для props React-компонентов
- Всегда определяй все типы явно

```typescript
// ✅ Хорошо - props названы как Props, используется type, есть JSDoc
type Props = {
  onClick: () => void;
  children: ReactNode;
};

/**
 * Компонент кнопки для взаимодействия с пользователем
 */
export const Button = ({ onClick, children }: Props) => {
  return <button onClick={onClick}>{children}</button>;
};

type Props = {
  cards: Card[];
  onSelect: (id: string) => void;
};

/**
 * Отображает список карт
 */
export const CardList = ({ cards, onSelect }: Props) => {
  return <div>...</div>;
};

// ❌ Плохо - props названы неправильно
type CardProps = { ... }
export const CardList = ({ ... }: Props) => { ... }

// ❌ Плохо - используется interface вместо type
interface ButtonProps { ... }

// ❌ Плохо - отсутствуют типы
export const Button = ({ onClick, children }: any) => { ... }
```

## Управление состоянием

**Локальное состояние**: `useState` для состояния конкретного компонента
```typescript
const [isOpen, setIsOpen] = useState(false);
const [selected, setSelected] = useState<string | null>(null);
```

**Глобальное состояние**: react context + react-query
- Используй обертки над `useContext` для доступа к глобальному состоянию
- Используй `react-query` для асинхронных данных и кэширования

**Сложная логика**: Выноси в кастомные хуки
```tsx
// hooks/useCardSelection.ts
export const useCardSelection = (cards: Card[]) => {
  const [selected, setSelected] = useState<string | null>(null);
  
  const select = (id: string) => {
    setSelected(id);
  };
  
  const selectedCard = cards.find(c => c.id === selected);
  
  return { selected, selectedCard, select };
};

// Использование в компоненте
type Props = {
  cards: Card[];
};

export const CardList = ({ cards }: Props) => {
  const { selected, select } = useCardSelection(cards);
  
  return <div>...</div>;
};
```

**Избегай useEffect и избыточной мемоизации**
- Предпочитай производное состояние вместо useEffect, когда возможно
- Избегай преждевременной оптимизации с `useMemo` и `useCallback`
- Используй мемоизацию только при доказанных проблемах с производительностью

```tsx
// ✅ Хорошо - производное состояние вместо useEffect
type Props = {
  cards: Card[];
  filter: string;
};

export const CardList = ({ cards, filter }: Props) => {
  const filteredCards = cards.filter(card => 
    card.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div>
      {filteredCards.map(card => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
};

// ❌ Плохо - ненужный useEffect
export const CardList = ({ cards, filter }: Props) => {
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  
  useEffect(() => {
    setFilteredCards(
      cards.filter(card => 
        card.name.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [cards, filter]);
  
  return <div>...</div>;
};

// ❌ Плохо - избыточная мемоизация
export const CardList = ({ cards }: Props) => {
  const handleClick = useCallback((id: string) => {
    // простой обработчик не требует мемоизации
  }, []);
  
  const memoizedCards = useMemo(() => cards, [cards]);
  
  return <div>...</div>;
};
```

## Паттерны TypeScript

**Всегда определяй все типы явно**
- Никогда не используй тип `any`
- Определяй типы (не интерфейсы) для всех props (Props)
- Типизируй все параметры функций и возвращаемые значения
- Типизируй обработчики событий правильно

**Тип props**
```tsx
type Props = {
  card: Card;
  onClick?: (id: string) => void;
  children?: ReactNode;
};

/**
 * Компонент карты отображает информацию о карте с опциональным обработчиком клика
 */
export const Card = ({ 
  card, 
  onClick, 
  children 
}: Props) => {
  // Реализация
};
```

## Частые паттерны

**Состояния загрузки**
```tsx
export const CardList = () => {
  const { data: cards, isLoading, isError } = useCards();
  
  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;
  if (!cards?.length) return <Empty />;
  
  return <div>{cards.map(card => ...)}</div>;
};
```

**Условный рендеринг**
- Выноси сложную условную логику за пределы JSX
- Используй ранние возвраты для охранных условий
- Избегай множественных вложенных условий в JSX

```tsx
// ✅ Хорошо - ранние возвраты
type Props = {
  card: Card | null;
  isLoading: boolean;
};

export const CardDetails = ({ card, isLoading }: Props) => {
  if (isLoading) return <Spinner />;
  if (!card) return null;

  return <CardDetails card={card} />;
};

// ✅ Хорошо - вынесенная условная логика
type CardStatusProps = {
  status: CardStatus;
  isActive: boolean;
};

export const CardStatus = ({ status, isActive }: Props) => {
  const getStatusComponent = () => {
    if (status === 'pending') {
      return <PendingStatus />;
    }
    
    if (isActive) {
      return <ActiveStatus />;
    }
    
    return <InactiveStatus />;
  };
  
  return <div>{getStatusComponent()}</div>;
};

// ✅ Хорошо - простой тернарный оператор для бинарных случаев
return isOpen ? <Modal /> : null;

// ❌ Плохо - множественные вложенные условия в JSX
return isOpen ? (
  isLoading ? <Spinner /> : hasError ? <Error /> : <Content />
) : null;

// ❌ Плохо - сложные условия напрямую в JSX
return (
  <div>
    {status === 'pending' ? (
      <Pending />
    ) : isActive ? (
      <Active />
    ) : hasError ? (
      <Error />
    ) : (
      <Default />
    )}
  </div>
);
```

**Обработчики событий**
- Не определяй обработчики прямо в JSX
- Выноси обработчики в именованные функции за пределы JSX
- Префикс обработчиков - "handle"
- Передавай обработчики через props с префиксом "on"

```tsx
// ✅ Хорошо - обработчики вынесены за пределы JSX
type Props = {
  card: Card;
  onSelect: (id: string) => void;
};

export const CardItem = ({ card, onSelect }: Props) => {
  const handleClick = () => {
    onSelect(card.id);
  };
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSelect(card.id);
    }
  };
  
  return (
    <div 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {card.name}
    </div>
  );
};

// ❌ Плохо - обработчики определены в JSX
export const CardItem = ({ card, onSelect }: Props) => {
  return (
    <div 
      onClick={() => onSelect(card.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect(card.id);
        }
      }}
    >
      {card.name}
    </div>
  );
};
```

## Паттерны производительности

**Мемоизация — используй только когда нужно**
```tsx
// ✅ Хорошо — мемоизируй только дорогие вычисления
type Props = {
  data: LargeDataSet;
};

/**
 * Компонент с тяжёлыми вычислениями
 */
export const ExpensiveComponent = ({ data }: Props) => {
  const processed = useMemo(
    () => heavyProcessing(data),
    [data]
  );
  
  return <div>{processed}</div>;
};

// ✅ Хорошо — мемоизируй колбэки только при передаче в мемоизированные дочерние компоненты
type Props = {
  children: ReactNode;
};

export const Parent = ({ children }: Props) => {
  const handleClick = useCallback((id: string) => {
    console.log(id);
  }, []);
  
  return <MemoizedChild onClick={handleClick} />;
};

// Мемоизируй компоненты только при доказанных проблемах с производительностью
const Child = memo<ChildProps>(({ onClick }) => {
  return <button onClick={() => onClick('id')}>Click</button>;
});

// ❌ Плохо — избыточная мемоизация
export const CardList = ({ cards }: Props) => {
  const handleClick = useCallback((id: string) => {
    // простой обработчик не нуждается в мемоизации
  }, []);
  
  const memoizedCards = useMemo(() => cards, [cards]);
  
  return <div>...</div>;
};
```

## Документация

**JSDoc-комментарии для компонентов**
- Добавляй JSDoc-документацию для всех React-компонентов
- Документируй назначение и функциональность компонента
- Описывай только то, что делает компонент, не его props

```typescript
// ✅ Хорошо - компонент с JSDoc
type Props = {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
};

/**
 * Компонент кнопки для взаимодействия с пользователем.
 */
export const Button = ({ onClick, children, disabled }: Props) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

// ✅ Хорошо - контейнерный компонент с JSDoc
/**
 * Контейнерный компонент, подключающий CardList к Redux-хранилищу.
 * Загружает данные карт и обрабатывает действия выбора.
 */
export const CardListContainer = () => {
  const cards = useAppSelector(cardsSelector);
  const dispatch = useAppDispatch();

  const handleSelect = (id: string) => {
    dispatch(selectCard(id));
  };

  return <CardList cards={cards} onSelect={handleSelect} />;
};

// ❌ Плохо - компонент без JSDoc
export const Button = ({ onClick, children }: Props) => {
  return <button onClick={onClick}>{children}</button>;
};
```

## Чек-лист

Перед завершением компонента:
- [ ] Компонент функциональный (без классовых компонентов)
- [ ] Компонент НЕ использует тип `FC` или `FunctionComponent`
- [ ] Тип props (не interface) назван как Props
- [ ] Все типы определены явно (без `any`)
- [ ] JSDoc-документация добавлена для компонента
- [ ] Компонент и разметка логически декомпозированы
- [ ] Обработчики событий вынесены за пределы JSX
- [ ] Сложная условная логика вынесена за пределы JSX
- [ ] Множественные данные стора вынесены в контейнерный компонент при необходимости
- [ ] Удалось избежать ненужных `useEffect` и избыточной мемоизации
- [ ] Правильное именование файлов (PascalCase для компонентов)
- [ ] Обработчики событий следуют соглашению по именованию (handle*)
- [ ] Обработаны состояния загрузки/ошибки
