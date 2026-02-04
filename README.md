# Murph

Full-Stack Web Application with React frontend and FastAPI backend.

## Repository Structure

This is a monorepo containing:

- **`frontend/`** - React 19 + TypeScript + Vite application with Tailwind CSS
- **`backend/`** - FastAPI application with Python 3.13 and Supabase

## Quick Start

### Full Repository

Clone the entire repository:

```bash
git clone https://github.com/vatsalpjain/Murph.git
cd Murph
```

### Frontend Only

If you only need the frontend, you can clone just that folder using sparse checkout:

**Option 1: Use the helper script**

```bash
# Clone and run the script
git clone https://github.com/vatsalpjain/Murph.git
cd Murph
./pull-frontend.sh ../murph-frontend
```

**Option 2: Manual sparse checkout**

```bash
git clone --no-checkout https://github.com/vatsalpjain/Murph.git murph-frontend
cd murph-frontend
git sparse-checkout init --cone
git sparse-checkout set frontend
git checkout
```

Then install and run:

```bash
cd frontend
npm install
npm run dev
```

See [`frontend/SETUP.md`](frontend/SETUP.md) for detailed frontend documentation.

### Backend Only

Similarly, you can clone just the backend:

```bash
git clone --no-checkout https://github.com/vatsalpjain/Murph.git murph-backend
cd murph-backend
git sparse-checkout init --cone
git sparse-checkout set backend
git checkout
```

See `backend/README.md` for backend documentation.

## Development

For full stack development, both frontend and backend can run simultaneously:

```bash
# Terminal 1 - Backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Documentation

- **Agent Instructions**: See [`Agent Instructions.md`](Agent%20Instructions.md) for AI agent guidelines
- **Frontend**: See [`frontend/README.md`](frontend/README.md) and [`frontend/SETUP.md`](frontend/SETUP.md)
- **Backend**: See [`backend/README.md`](backend/README.md)

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4

### Backend
- Python 3.13
- FastAPI
- Supabase

## Contributing

This is a resume/portfolio project. Please refer to the Agent Instructions for development guidelines.
