#!/bin/bash
echo "🚀 Deploying mcl-app..."
git pull origin main
docker build -t mudhihirdocker/mcl-app:latest .
echo $DOCKER_HUB_TOKEN | docker login -u mudhihirdocker --password-stdin
docker push mudhihirdocker/mcl-app:latest
echo "✅ Deployment complete!"
