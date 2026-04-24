.PHONY: up down build cli clean restart-supervisor serve restart kill-port schema-dump

up:
	docker compose up -d
down:
	docker compose down
build:
	docker compose down && docker compose build && docker compose up -d
cli:
	docker compose exec -it api bash
clean:
	docker compose stop
	docker compose rm -f
restart-supervisor:
	docker compose exec api supervisorctl reread
	docker compose exec api supervisorctl update
	docker compose exec api supervisorctl restart all

serve:
	docker compose exec api supervisorctl stop all
	- kill-port
	docker compose exec api php artisan serve --host=0.0.0.0 --port=8000

kill-port:
	@echo "Killing process on port 8000..."
	docker compose exec api bash -c "pkill -f swoole || kill -9 \$\$(netstat -tlnp | grep :8000 | awk '{print \$$7}' | cut -d/ -f1) || true"

restart:
	docker compose restart api

schema-dump:
	mkdir -p database/sql
	docker compose exec -T postgres pg_dump --schema-only --no-owner --no-privileges -U $$POSTGRES_USER $$POSTGRES_DB > database/sql/schema.sql
