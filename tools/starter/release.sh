#!/usr/bin/env bash
# Релиз @builtbysasha/starter.
# Поднимает версию в package.json, делает commit и push в main.
# CI увидит новую версию и опубликует пакет в npm автоматически — теги не нужны.

set -euo pipefail

BUMP="${1:-patch}"

case "$BUMP" in
    patch|minor|major) ;;
    *)
        echo "Usage: $0 [patch|minor|major]" >&2
        exit 1
        ;;
esac

PKG_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$PKG_DIR/../.." && pwd)"

cd "$ROOT_DIR"

BRANCH="$(git branch --show-current)"
if [ "$BRANCH" != "main" ]; then
    echo "Error: must be on 'main' branch (now: '$BRANCH')" >&2
    exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Error: working tree has uncommitted changes. Commit or stash first." >&2
    exit 1
fi

git pull --ff-only

cd "$PKG_DIR"
pnpm version "$BUMP" --no-git-tag-version
NEW_VERSION="$(node -p "require('./package.json').version")"

cd "$ROOT_DIR"
git add "$PKG_DIR/package.json"
git commit -m "release(starter): v${NEW_VERSION}"
git push origin main

echo ""
echo "Done: starter@${NEW_VERSION} pushed to main."
echo "CI опубликует пакет в npm автоматически."
