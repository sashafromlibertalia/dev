MAKEFLAGS += --silent

help: ## Показывает справку по командам
	@printf "\033[33m%s:\033[0m\n" 'Доступные команды'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

test-eslint: ## Запуск eslint
	@printf "\033[33m%s:\033[0m\n" 'Тестирование eslint'
	cd packages/eslint && npm run test

test-stylelint: ## Запуск stylelint
	@printf "\033[33m%s:\033[0m\n" 'Тестирование stylelint'
	cd packages/stylelint && npm run test

.DEFAULT_GOAL := help
