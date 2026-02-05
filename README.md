# MURPH - Course Marketplace Homescreen

A modern, interactive course marketplace platform featuring video course previews with hover-to-play functionality.

## Features

- 🎥 **Course Shorts Preview** - Hover over course cards to preview 30-second video clips
- 🎯 **Personalized Recommendations** - AI-powered course suggestions
- 📚 **Continue Learning** - Pick up where you left off
- 🎨 **Modern UI** - Built with React, TypeScript, and Tailwind CSS

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run at `http://localhost:5173/` (or next available port).

## Project Structure

```
new homescreen/
├── src/
│   ├── main.tsx          # App entry point
│   ├── App.tsx           # Main App component with routing
│   └── index.css         # Global styles
├── components/
│   ├── CourseShortsPreview.tsx  # Video shorts gallery
│   ├── CourseCard.tsx           # Course recommendation cards
│   ├── ResumeCard.tsx           # Continue learning card
│   ├── Navbar.tsx               # Navigation bar
│   ├── Hero.tsx                 # Hero section
│   └── Footer.tsx               # Footer component
├── pages/
│   └── HomePage.tsx      # Main homepage
├── public/
│   └── shorts/
│       ├── metadata.json        # Course shorts metadata
│       └── *.mp4               # Video files
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Course Shorts

The course shorts feature displays 30-second vertical video previews that:
- Auto-play on hover (muted)
- Pause and reset when mouse leaves
- Redirect to full YouTube course on click

Shorts metadata is stored in `public/shorts/metadata.json` with format:
```json
[
  {
    "id": "course-1",
    "title": "Introduction",
    "courseTitle": "Guitar Lessons",
    "instructor": "Instructor Name",
    "videoPath": "/shorts/course-1_short.mp4",
    "courseUrl": "https://youtube.com/..."
  }
]
```

## License

MIT
