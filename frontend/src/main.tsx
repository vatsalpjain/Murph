import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TeacherDashboard from './pages/teacher_dashboard'

// Entry point - renders the TeacherDashboard component
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TeacherDashboard />
  </StrictMode>,
)
