# Использование eslint

[Home page](../../README.md)

## Description

This package contains linting rules for `.js` / `.ts` / `.tsx` files.

## Installation

```shell
npm install @builtbysasha/eslint-config -D
```

## Setup

Add the following to your `.eslintrc` file:

```json
{
  "extends": ["@builtbysasha/eslint-config"]
}
```

### JavaScript-based projects

```json
{
  "extends": [
    "@builtbysasha/eslint-config"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  }
}
```

### TypeScript-based projects

```json
{
  "extends": [
    "@builtbysasha/eslint-config/typescript"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "parser": "@typescript-eslint/parser"
}
```

### React-Typescript-based projects

```json
{
  "extends": [
    "plugin:react/recommended",
    "plugin:storybook/recommended",
    "@builtbysasha/eslint-config/react-ts"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "parser": "@typescript-eslint/parser"
}
```
