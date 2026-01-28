#!/bin/bash

# Environment switcher script for Hi2 Backend
# Usage: ./switch-env.sh [dev|stage|prod]

set -e

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: ./switch-env.sh [dev|stage|prod]"
    echo ""
    echo "Available environments:"
    echo "  dev   - Development environment"
    echo "  stage - Staging environment"
    echo "  prod  - Production environment"
    exit 1
fi

case "$ENV" in
    dev)
        ENV_FILE=".env.development"
        ;;
    stage)
        ENV_FILE=".env.staging"
        ;;
    prod)
        ENV_FILE=".env.production"
        ;;
    *)
        echo "Error: Invalid environment '$ENV'"
        echo "Valid options: dev, stage, prod"
        exit 1
        ;;
esac

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file '$ENV_FILE' not found!"
    echo "Please create it from .env.example:"
    echo "  cp .env.example $ENV_FILE"
    exit 1
fi

# Create/Update .env symlink to point to the selected environment
cp "$ENV_FILE" .env

echo "✓ Environment switched to: $ENV"
echo "✓ Using configuration from: $ENV_FILE"
echo ""
echo "You can now run: npm run dev"
