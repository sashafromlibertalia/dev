import { access, constants, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { TemplateEntry } from './templates.js';

export async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

export type WriteResult = {
    destination: string;
    overwritten: boolean;
};

export async function writeTemplate(
    entry: TemplateEntry,
    templatesRoot: string,
    cwd: string,
): Promise<WriteResult> {
    const sourcePath = resolve(templatesRoot, entry.source);
    const targetPath = resolve(cwd, entry.destination);

    const existed = await fileExists(targetPath);
    const content = await readFile(sourcePath, 'utf8');

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, 'utf8');

    // Если рядом с исходным файлом лежит папка references/ (доп. материалы скилла),
    // копируем её целиком вслед за основным файлом — без отдельного пункта в TEMPLATES.
    const referencesSource = join(dirname(sourcePath), 'references');
    if (await fileExists(referencesSource)) {
        await cp(referencesSource, join(dirname(targetPath), 'references'), { recursive: true });
    }

    return { destination: entry.destination, overwritten: existed };
}
