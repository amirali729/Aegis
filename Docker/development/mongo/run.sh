#!/usr/bin/env bash

docker run -d \
  --name identity-mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=rootpassword \
  -e MONGO_INITDB_DATABASE=identity_platform \
  -v identity_mongodb_data:/data/db \
  mongo:8