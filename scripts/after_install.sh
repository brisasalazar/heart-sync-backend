#!/bin/bash
cd /home/ubuntu/heart-sync-backend

if [ ! -f ".env" ]; then
  echo "ERROR: .env file not found"
  exit 1
else
  echo ".env file found."
fi

npm install