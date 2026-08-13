import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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
// АГЕНТЫ И СКИЛЛЫ CLAUDE CODE — АВТООБНАРУЖЕНИЕ
// ────────────────────────────────────────────────────────────────────────────
// Каждый .md в templates/claude/agents/ и каждая папка с SKILL.md в
// templates/claude/skills/ автоматически становится пунктом списка. Чтобы
// добавить агента или скилл — просто положи файл в templates/, ничего в
// тулинге менять не нужно. Содержимое references/ рядом со SKILL.md копируется
// сама (см. writer.ts).
// ────────────────────────────────────────────────────────────────────────────

function discoverAgents(): TemplateEntry[] {
    const dir = join(TEMPLATES_ROOT, 'claude/agents');
    if (!existsSync(dir)) return [];

    return readdirSync(dir)
        .filter((file) => file.endsWith('.md'))
        .sort()
        .map((file) => {
            const name = file.replace(/\.md$/, '');
            return {
                id: `claude-agent-${name}`,
                category: 'claude',
                label: `agent: ${name}`,
                description: `Агент ${name}`,
                source: `claude/agents/${file}`,
                destination: `.claude/agents/${file}`,
            };
        });
}

function discoverSkills(): TemplateEntry[] {
    const dir = join(TEMPLATES_ROOT, 'claude/skills');
    if (!existsSync(dir)) return [];

    return readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, 'SKILL.md')))
        .map((entry) => entry.name)
        .sort()
        .map((name) => ({
            id: `claude-skill-${name}`,
            category: 'claude',
            label: `skill: ${name}`,
            description: `Скилл ${name}`,
            source: `claude/skills/${name}/SKILL.md`,
            destination: `.claude/skills/${name}/SKILL.md`,
        }));
}

// ────────────────────────────────────────────────────────────────────────────
// ЯВНАЯ МАПА РАЗМЕЩЕНИЯ ОСТАЛЬНЫХ ШАБЛОНОВ
// ────────────────────────────────────────────────────────────────────────────
// Всё, что не является агентом или скиллом, жёстко привязано к целевому пути
// в проекте, где запускается CLI. Чтобы изменить, куда кладётся файл — правь
// поле `destination`. Путь указывается относительно CWD (папки запуска CLI).
//
// Структура строки destination:
//   '.'              → корень проекта
//   'src/styles/...' → вложенная папка проекта (создаётся автоматически)
//
// ────────────────────────────────────────────────────────────────────────────
const STATIC_TEMPLATES: readonly TemplateEntry[] = [
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
        source: 'gitignore/gitignore.template',
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
];

export const TEMPLATES: readonly TemplateEntry[] = [
    ...STATIC_TEMPLATES,
    ...discoverAgents(),
    ...discoverSkills(),
];
