#!/bin/bash
cd /home/ubuntu/heart-sync-backend

if [ -f ".env" ]; then
    set -o allexport
    source .env
    set +o allexport
    echo ".env loaded"
else
    echo "ERROR: .env not found!"
    exit 1
fi

node app.js > /dev/null 2>&1 &