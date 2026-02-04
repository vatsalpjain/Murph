#!/bin/bash

# Script to clone only the frontend folder from the Murph repository
# This uses Git sparse checkout to pull only the frontend directory

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REPO_URL="https://github.com/vatsalpjain/Murph.git"
TARGET_DIR="${1:-murph-frontend}"

echo -e "${YELLOW}Cloning frontend folder from Murph repository...${NC}"

# Clone with no checkout
git clone --no-checkout "$REPO_URL" "$TARGET_DIR"

cd "$TARGET_DIR"

# Enable sparse checkout
echo -e "${YELLOW}Configuring sparse checkout...${NC}"
git sparse-checkout init --cone

# Set to pull only frontend folder
echo -e "${YELLOW}Pulling frontend folder...${NC}"
git sparse-checkout set frontend

# Checkout the files (explicitly use main branch)
git checkout main

echo -e "${GREEN}Success! Frontend folder cloned to $TARGET_DIR${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "  cd $TARGET_DIR/frontend"
echo "  npm install"
echo "  npm run dev"
