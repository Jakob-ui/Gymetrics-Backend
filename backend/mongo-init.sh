#!/bin/bash
set -e

# Warte bis MongoDB läuft
sleep 10

# Nutze "mongo" statt "mongosh"
mongo --username "$MONGO_INITDB_ROOT_USERNAME" \
      --password "$MONGO_INITDB_ROOT_PASSWORD" \
      --authenticationDatabase admin <<EOF
use $APP_DATABASE
db.createUser({
  user: '$APP_USERNAME',
  pwd: '$APP_PASSWORD',
  roles: [{ role: 'readWrite', db: '$APP_DATABASE' }]
})
EOF

echo "App-User '$APP_USERNAME' wurde erfolgreich für DB '$APP_DATABASE' erstellt!"