#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
(cd frontend && { [ -d node_modules ] || npm install; } && npm run build)
cd backend
python3 -m pip install -q -r requirements.txt
python3 manage.py migrate --noinput
[ -f .admin_created ] || { python3 manage.py createsuperuser && touch .admin_created; }
echo "Website: http://127.0.0.1:8010   Admin: http://127.0.0.1:8010/admin"
python3 manage.py runserver 127.0.0.1:8010
