MAKEFLAGS += --silent

export COMPOSE_PROJECT_NAME ?= 
export PROJECT_ID ?= 
export DOCKER_BUILDKIT = 1

help: ## Справка по командам
	@printf "\033[33m%s:\033[0m\n" 'Доступные команды'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

init: clean install start info ## Инициализация проекта

clean: ## Очистка проекта
	docker-compose down --rmi local -v

install: ## Установка зависимостей
	docker-compose run --no-deps --rm -T frontend npm install

start: ## Запуск проекта
	docker-compose up -d --no-build
restart: stop start info ## Перезапуск проекта
stop:
	docker-compose down

lint: ## Проверка кода
	@printf "\033[33m%s:\033[0m\n" 'ESLint'
	docker-compose exec -T frontend npm run eslint
	@printf "\033[33m%s:\033[0m\n" 'Stylelint'
	docker-compose exec -T frontend npm run stylelint

cs-fix: ## Форматирование кода
	@printf "\033[33m%s:\033[0m\n" 'ESLint'
	docker-compose exec -T frontend npm run eslint:fix
	@printf "\033[33m%s:\033[0m\n" 'Stylelint'
	docker-compose exec -T frontend npm run stylelint:fix

ps: ## Список запущенных контейнеров
	docker-compose ps

info:
	echo "site: http://localhost:20${PROJECT_ID}"

.DEFAULT_GOAL := help
