#!/usr/bin/env bash
# Render build script: builds the React website, installs Django, prepares static files and the database.
set -o errexit

echo "==> Building the website (React)"
cd frontend
npm ci
npm run build
cd ..

echo "==> Installing Django and packages"
cd backend
pip install -r requirements.txt

echo "==> Collecting static files"
python manage.py collectstatic --noinput

echo "==> Updating the database"
python manage.py migrate --noinput

# Free Render services have no shell, so the first admin account is created from environment variables
# (DJANGO_SUPERUSER_USERNAME / DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD). Skipped if it already exists.
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py createsuperuser --noinput 2>/dev/null && echo "==> Admin account created" || echo "==> Admin account already exists"
fi
