import { ExitPromptError } from '@inquirer/core';
import { checkbox, confirm } from '@inquirer/prompts';
import { resolve } from 'node:path';
import { TEMPLATES, TEMPLATES_ROOT, type TemplateEntry } from './templates.js';
import { fileExists, writeTemplate } from './writer.js';

const cwd = process.cwd();

type Choice = {
    name: string;
    value: string;
    short: string;
};

function buildChoices(): Choice[] {
    return TEMPLATES.map((entry) => ({
        name: `[${entry.category}] ${entry.label}  →  ${entry.destination}`,
        value: entry.id,
        short: entry.label,
    }));
}

async function main(): Promise<void> {
    if (TEMPLATES.length === 0) {
        console.log('Шаблоны не найдены.');
        return;
    }

    const selectedIds = await checkbox({
        message: 'Выберите шаблоны для создания:',
        choices: buildChoices(),
        pageSize: 15,
        required: true,
    });

    const entries: TemplateEntry[] = TEMPLATES.filter((t) => selectedIds.includes(t.id));

    const conflicts: string[] = [];
    for (const entry of entries) {
        if (await fileExists(resolve(cwd, entry.destination))) {
            conflicts.push(entry.destination);
        }
    }

    if (conflicts.length > 0) {
        const proceed = await confirm({
            message: `Уже существуют и будут перезаписаны:\n${conflicts.map((c) => `  • ${c}`).join('\n')}\nПродолжить?`,
            default: false,
        });
        if (!proceed) {
            console.log('Отменено.');
            return;
        }
    }

    console.log('');
    for (const entry of entries) {
        const result = await writeTemplate(entry, TEMPLATES_ROOT, cwd);
        const status = result.overwritten ? 'перезаписан' : 'создан     ';
        console.log(`  ${status}  ${result.destination}`);
    }

    console.log(`\nГотово: создано ${entries.length} файл(ов).`);
}

main().catch((err: unknown) => {
    if (err instanceof ExitPromptError) {
        return;
    }
    console.error(err);
    process.exit(1);
});
