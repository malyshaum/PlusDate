-- PostgreSQL role model for PlusDate.
-- Execute as a superuser or bootstrap database owner.
-- Replace the placeholder passwords before applying in production.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'plusdate_app_read') THEN
        CREATE ROLE plusdate_app_read LOGIN PASSWORD 'change_me_read_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'plusdate_app_write') THEN
        CREATE ROLE plusdate_app_write LOGIN PASSWORD 'change_me_write_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'plusdate_admin') THEN
        CREATE ROLE plusdate_admin LOGIN PASSWORD 'change_me_admin_password' NOSUPERUSER CREATEDB CREATEROLE INHERIT;
    END IF;
END
$$;

GRANT CONNECT ON DATABASE plusdate TO plusdate_app_read, plusdate_app_write, plusdate_admin;
GRANT USAGE ON SCHEMA public TO plusdate_app_read, plusdate_app_write, plusdate_admin;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO plusdate_app_read;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO plusdate_app_read;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO plusdate_app_write;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO plusdate_app_write;

GRANT ALL PRIVILEGES ON SCHEMA public TO plusdate_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO plusdate_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO plusdate_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO plusdate_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO plusdate_app_read;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO plusdate_app_read;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO plusdate_app_write;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO plusdate_app_write;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO plusdate_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO plusdate_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO plusdate_admin;
