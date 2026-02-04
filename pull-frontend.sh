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
# Directory names must start with alphanumeric or underscore, and can contain dashes
# This prevents command injection through directory names like "-rf"
if [[ ! "$TARGET_DIR" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_-]*(/[a-zA-Z0-9_][a-zA-Z0-9_-]*)*$ ]]; then
    echo -e "${RED}Error: Invalid target directory name.${NC}"
    echo -e "${YELLOW}Directory name must start with a letter, number, or underscore.${NC}"
    echo -e "${YELLOW}It can contain letters, numbers, dashes, and underscores.${NC}"
    echo -e "${YELLOW}You can use forward slashes for subdirectories (e.g., 'projects/murph-frontend').${NC}"
    exit 1
fi

# Prevent excessive directory nesting (max 3 directory components: a/b/c)
# Count the number of slashes - 2 slashes = 3 components
DEPTH=$(echo "$TARGET_DIR" | tr -cd '/' | wc -c)
if [ "$DEPTH" -gt 2 ]; then
    echo -e "${RED}Error: Directory path is too deeply nested.${NC}"
    echo -e "${YELLOW}Maximum of 3 directory components allowed (e.g., 'level1/level2/level3').${NC}"
    exit 1
fi

# Check if target directory already exists
if [ -d "$TARGET_DIR" ]; then
    echo -e "${RED}Error: Directory '$TARGET_DIR' already exists.${NC}"
    echo -e "${YELLOW}Please choose a different directory name or remove the existing one.${NC}"
    exit 1
fi

echo -e "${YELLOW}Cloning frontend folder from Murph repository...${NC}"

# Clone with no checkout, explicitly from main branch
if ! git clone --no-checkout --branch main "$REPO_URL" "$TARGET_DIR"; then
    echo -e "${RED}Error: Failed to clone repository.${NC}"
    echo -e "${YELLOW}Please check your network connection and try again.${NC}"
    exit 1
fi

cd "$TARGET_DIR" || {
    echo -e "${RED}Error: Failed to change to target directory.${NC}"
    exit 1
}

# Enable sparse checkout
echo -e "${YELLOW}Configuring sparse checkout...${NC}"
git sparse-checkout init --cone

# Set to pull only frontend folder
echo -e "${YELLOW}Pulling frontend folder...${NC}"
git sparse-checkout set frontend

# Checkout the files (explicitly use main branch)
git checkout main

# Get absolute path for clearer success message
ABS_PATH=$(pwd)

echo -e "${GREEN}Success! Frontend folder cloned to $ABS_PATH${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "  cd $ABS_PATH/frontend"
echo "  npm install"
echo "  npm run dev"
