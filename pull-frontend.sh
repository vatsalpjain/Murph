#!/bin/bash

# Script to clone only the frontend folder from the Murph repository
# This uses Git sparse checkout to pull only the frontend directory

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

REPO_URL="https://github.com/vatsalpjain/Murph.git"
TARGET_DIR="${1:-murph-frontend}"

# Validate target directory name to prevent path traversal and other security issues
# Only allow alphanumeric, dash, underscore, and single forward slashes for subdirectories
if [[ ! "$TARGET_DIR" =~ ^[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*$ ]]; then
    echo -e "${RED}Error: Invalid target directory name.${NC}"
    echo -e "${YELLOW}Directory name must contain only letters, numbers, dashes, and underscores.${NC}"
    echo -e "${YELLOW}You can use forward slashes for subdirectories (e.g., 'projects/murph-frontend').${NC}"
    exit 1
fi

# Check if target directory already exists
if [ -d "$TARGET_DIR" ]; then
    echo -e "${RED}Error: Directory '$TARGET_DIR' already exists.${NC}"
    echo -e "${YELLOW}Please choose a different directory name or remove the existing one.${NC}"
    exit 1
fi

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
