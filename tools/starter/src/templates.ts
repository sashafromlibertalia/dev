import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Папка templates/ копируется из корня репозитория в dist/templates на этапе сборки
// (см. скрипт "build" в package.json) — так она попадает в npm-пакет вместе с dist/.
export const TEMPLATES_ROOT = resolve(here, 'templates');

export type TemplateEntry = {
    id: string;
    category: string;
    label: string;
    description: string;
    source: string;
    destination: string;
};

// ────────────────────────────────────────────────────────────────────────────
// ЯВНАЯ МАПА РАЗМЕЩЕНИЯ ШАБЛОНОВ
// ────────────────────────────────────────────────────────────────────────────
// Каждый шаблон из templates/ жёстко привязан к целевому пути в проекте,
// где запускается CLI. Чтобы изменить, куда кладётся файл — правь поле
// `destination`. Путь указывается относительно CWD (папки запуска CLI).
//
// Структура строки destination:
//   '.'              → корень проекта
//   'src/styles/...' → вложенная папка проекта (создаётся автоматически)
//
// ────────────────────────────────────────────────────────────────────────────
export const TEMPLATES: readonly TemplateEntry[] = [
    // ══ КОНФИГИ ПРОЕКТА → всегда в корень (./) ═══════════════════════════════
    {
        id: 'biome',
        category: 'configs',
        label: 'biome.json',
        description: 'Конфиг форматера/линтера Biome',
        source: 'biome/biome.json',
        destination: 'biome.json',
    },
    {
        id: 'gitignore',
        category: 'configs',
        label: '.gitignore',
        description: 'Стандартный .gitignore для Node/Vite/Next',
        source: 'gitignore/.gitignore',
        destination: '.gitignore',
    },

    // ══ СТИЛИ → в src/styles/ ═══════════════════════════════════════════════
    {
        id: 'css-reset',
        category: 'styles',
        label: 'reset.css',
        description: 'CSS reset — кладётся в src/styles/',
        source: 'css/reset.css',
        destination: 'src/app/styles/reset.css',
    },

    // ══ CLAUDE CODE: ГЛОБАЛЬНЫЕ ИНСТРУКЦИИ → в корень (./) ═══════════════════
    {
        id: 'claude-md',
        category: 'claude',
        label: 'CLAUDE.md',
        description: 'Глобальные инструкции для Claude',
        source: 'claude/CLAUDE.md',
        destination: 'CLAUDE.md',
    },

    // ══ CLAUDE CODE: АГЕНТЫ → в .claude/agents/ ══════════════════════════════
    {
        id: 'claude-agent-feature-impact-analyst',
        category: 'claude',
        label: 'agent: feature-impact-analyst',
        description: 'Агент анализа влияния фич',
        source: 'claude/agents/feature-impact-analyst.md',
        destination: '.claude/agents/feature-impact-analyst.md',
    },

    // ══ CLAUDE CODE: СКИЛЛЫ → в .claude/skills/<name>/SKILL.md ═══════════════
    {
        id: 'claude-skill-frontend-best-practices',
        category: 'claude',
        label: 'skill: frontend-best-practices',
        description: 'Скилл паттернов проектирования фронтенда',
        source: 'claude/skills/frontend-best-practices/SKILL.md',
        destination: '.claude/skills/frontend-best-practices/SKILL.md',
    },
    {
        id: 'claude-skill-translate',
        category: 'claude',
        label: 'skill: translate',
        description: 'Скилл добавления локалей',
        source: 'claude/skills/translate/SKILL.md',
        destination: '.claude/skills/translate/SKILL.md',
    },
    {
        id: 'claude-skill-css-modules-styling',
        category: 'claude',
        label: 'skill: css-modules-styling',
        description: 'Скилл стилизации через CSS Modules',
        source: 'claude/skills/css-modules-styling/SKILL.md',
        destination: '.claude/skills/css-modules-styling/SKILL.md',
    },
    {
        id: 'claude-skill-react-components',
        category: 'claude',
        label: 'skill: react-components',
        description: 'Скилл создания React-компонентов',
        source: 'claude/skills/react-components/SKILL.md',
        destination: '.claude/skills/react-components/SKILL.md',
    },
    {
        id: 'claude-skill-i18n-setup',
        category: 'claude',
        label: 'skill: i18n-setup',
        description: 'Скилл настройки интернационализации',
        source: 'claude/skills/i18n-setup/SKILL.md',
        destination: '.claude/skills/i18n-setup/SKILL.md',
    },
    {
        id: 'claude-skill-typescript-patterns',
        category: 'claude',
        label: 'skill: typescript-patterns',
        description: 'Скилл TypeScript-паттернов',
        source: 'claude/skills/typescript-patterns/SKILL.md',
        destination: '.claude/skills/typescript-patterns/SKILL.md',
    },
] as const;
