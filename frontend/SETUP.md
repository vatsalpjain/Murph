# Frontend Setup Guide

## Working with Just the Frontend

If you want to work with only the frontend folder from this monorepo, you can use Git sparse checkout:

### Clone Only Frontend Folder

```bash
# Initialize a new repository
git clone --no-checkout https://github.com/vatsalpjain/Murph.git murph-frontend
cd murph-frontend

# Enable sparse checkout
git sparse-checkout init --cone

# Pull only the frontend folder
git sparse-checkout set frontend

# Checkout the files
git checkout
```

### Install Dependencies

```bash
cd frontend
npm install
```

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Full Repository

To work with the complete monorepo (frontend + backend):

```bash
git clone https://github.com/vatsalpjain/Murph.git
cd Murph/frontend
npm install
npm run dev
```

## Environment Setup

The frontend is built with:
- React 19
- TypeScript
- Vite
- Tailwind CSS 4

Make sure you have Node.js installed (version 18 or higher recommended).
