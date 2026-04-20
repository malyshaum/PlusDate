#!/usr/bin/env zsh
set -e

commit_paths() {
  local msg="$1"
  shift
  git add "$@" 2>/dev/null || true
  if ! git diff --cached --quiet; then
    git commit -m "$msg" >/dev/null
  fi
}

# Ensure we are on orphan rebuild branch
current_branch=$(git branch --show-current)
if [[ "$current_branch" != "rebuilt_clean_history" ]]; then
  git checkout rebuilt_clean_history >/dev/null 2>&1 || true
fi

# Root
commit_paths "chore(repo): initialize monorepo and gitignore" .gitignore

# API core setup
commit_paths "build(api): add PHP manifests and artisan entry" api-main/composer.json api-main/package.json api-main/phpunit.xml api-main/artisan
commit_paths "chore(api): add containerization and runtime setup" api-main/Dockerfile api-main/docker-compose.yml api-main/nginx.conf api-main/Makefile api-main/docker
commit_paths "chore(api): add bootstrap files" api-main/bootstrap
commit_paths "chore(api): add application configuration" api-main/config
commit_paths "feat(api): add route definitions" api-main/routes

# API data/assets/tests
commit_paths "feat(api/db): add migrations" api-main/database/migrations
commit_paths "test(api/db): add factories" api-main/database/factories
commit_paths "chore(api/db): add seeders" api-main/database/seeders
commit_paths "feat(api): add localization resources" api-main/lang
commit_paths "feat(api): add public entrypoint and static files" api-main/public
commit_paths "feat(api): add blade/css/js resources" api-main/resources
commit_paths "test(api): add feature and unit test suites" api-main/tests

# API app layers
for d in api-main/app/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(api/app): add ${name} module" "$d"
done

# SPA setup
commit_paths "build(spa): add frontend build and lint configs" spa-main/package.json spa-main/vite.config.ts spa-main/tsconfig.json spa-main/tsconfig.app.json spa-main/tsconfig.node.json spa-main/eslint.config.js spa-main/index.html
commit_paths "chore(spa): add deployment and docker configs" spa-main/Dockerfile spa-main/docker-compose.yml spa-main/nginx.conf spa-main/railway.toml spa-main/README.md spa-main/DOCKER_SETUP.md
commit_paths "ci(spa): add github workflow" spa-main/.github/workflows

# SPA public
commit_paths "feat(spa/public): add offline shell and service worker" spa-main/public/offline.html spa-main/public/sw.js
for d in spa-main/public/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(spa/public): add ${name} static assets" "$d"
done

# SPA app/features/entities/processes/shared/widgets/pages/types
for d in spa-main/src/app/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(spa/app): add ${name} module" "$d"
done
commit_paths "feat(spa/app): add root app files" spa-main/src/app/*

for d in spa-main/src/entities/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(spa/entities): add ${name} entity" "$d"
done

for d in spa-main/src/features/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(spa/features): add ${name} feature" "$d"
done

for d in spa-main/src/processes/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(spa/processes): add ${name} process" "$d"
done

for d in spa-main/src/shared/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(spa/shared): add ${name} shared module" "$d"
done

for d in spa-main/src/widgets/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(spa/widgets): add ${name} widget" "$d"
done

for d in spa-main/src/pages/*; do
  [[ -d "$d" ]] || continue
  name=$(basename "$d")
  commit_paths "feat(spa/pages): add ${name} page" "$d"
done

commit_paths "feat(spa): add shared type declarations" spa-main/src/types

# Include any missed files
if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  if ! git diff --cached --quiet; then
    git commit -m "chore(repo): add remaining project files" >/dev/null
  fi
fi

# Make rebuilt history the default branch
git branch -M main

echo "TOTAL_COMMITS=$(git rev-list --count HEAD)"
git log --oneline --decorate -n 20
