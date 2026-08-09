# @builtbysasha/starter

Интерактивный CLI для добавления шаблонных файлов в текущий проект: конфиги, `.gitignore`, CSS-reset, инструкции и
скиллы для Claude Code

## Использование

Запусти в папке целевого проекта:

```bash
pnpx @builtbysasha/starter
# или
npx @builtbysasha/starter
```

CLI покажет чекбокс всех доступных шаблонов.

## Доступные шаблоны

Пути назначения жёстко прописаны в [`src/templates.ts`](src/templates.ts). Чтобы изменить, куда кладётся файл — правь
поле `destination`.

| Категория | Шаблон                           | Назначение                                        |
|-----------|----------------------------------|---------------------------------------------------|
| configs   | `biome.json`                     | `biome.json`                                      |
| configs   | `.gitignore`                     | `.gitignore`                                      |
| styles    | `reset.css`                      | `src/app/styles/reset.css`                        |
| claude    | `CLAUDE.md`                      | `CLAUDE.md`                                       |
| claude    | `agent: feature-impact-analyst`  | `.claude/agents/feature-impact-analyst.md`        |
| claude    | `skill: frontend-best-practices` | `.claude/skills/frontend-best-practices/SKILL.md` |
| claude    | `skill: translate`               | `.claude/skills/translate/SKILL.md`               |
| claude    | `skill: css-modules-styling`     | `.claude/skills/css-modules-styling/SKILL.md`     |
| claude    | `skill: react-components`        | `.claude/skills/react-components/SKILL.md`        |
| claude    | `skill: i18n-setup`              | `.claude/skills/i18n-setup/SKILL.md`              |
| claude    | `skill: typescript-patterns`     | `.claude/skills/typescript-patterns/SKILL.md`     |