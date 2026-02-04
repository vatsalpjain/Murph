# Frontend Authentication - Testing Guide

## ✅ What Was Implemented

### 1. **AuthContext** (`src/contexts/AuthContext.tsx`)
- Global authentication state management
- Login/Signup functions with backend integration
- Session persistence with localStorage
- Role-based routing logic

### 2. **AuthModal Component** (`src/components/AuthModal.tsx`)
- Coursera-style overlay modal (not separate pages!)
- Toggle between Login and Signup modes
- Email/password fields with validation
- Role selection for signup (Student/Teacher)
- Google OAuth placeholder button
- Beautiful UI matching your landing page aesthetic

### 3. **Updated Components**
- **App.tsx** - Wrapped with AuthProvider, added AuthModal
- **LandingPage.tsx** - Dynamic header buttons (Login/Join vs Dashboard/Logout)
- **AccountDashboard.tsx** - Protected route, shows user name, logout button

---

## 🎨 How It Works

### User Flow:

1. **Visitor on Landing Page:**
   - Sees "Log In" and "Join for Free" buttons
   - Clicks either → AuthModal appears as overlay

2. **AuthModal Experience:**
   - Toggle between Login and Signup
   - Signup: Email + Password + Name + Role (Student/Teacher)
   - Login: Email + Password only
   - Google button (placeholder for now)

3. **After Successful Auth:**
   - Modal closes automatically
   - User redirected based on role:
     - Student → `/dashboard` (AccountDashboard)
     - Teacher → `/dashboard` (same for now, can customize later)
   - Landing page header updates to show Dashboard + Logout

4. **Logged In Experience:**
   - Dashboard shows "Welcome, [Name]!"
   - Logout button available
   - Session persists on refresh (localStorage)

---

## 🚀 How to Test

### Step 1: Start Backend
```powershell
cd C:\dev\work\Murph\backend
uv run .\main.py
```

Should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Start Frontend
```powershell
cd C:\dev\work\Murph\frontend
npm run dev
```

Should see:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### Step 3: Test Signup
1. Open http://localhost:5173/
2. Click **"Join for Free"** button
3. Modal appears
4. Fill in form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234! (min 8 chars)
   - Role: Select Student or Teacher
5. Click "Sign Up"
6. Should redirect to Dashboard
7. Header should show "Welcome, Test User!"

### Step 4: Test Logout & Login
1. Click "Logout" button
2. Redirected to landing page
3. Click "Log In" button
4. Enter:
   - Email: test@example.com
   - Password: Test1234!
5. Click "Continue"
6. Should redirect to Dashboard again

### Step 5: Test Session Persistence
1. While logged in, refresh the page (F5)
2. Should stay logged in (data in localStorage)
3. Dashboard still shows your name

---

## 🔍 Debugging Tips

### If modal doesn't appear:
- Check browser console for errors
- Verify AuthContext is wrapping App component

### If login/signup fails:
- Open browser Network tab
- Check request to `http://localhost:8000/auth/login`
- Look at response status and error message
- Common issues:
  - Backend not running
  - CORS errors (check backend CORS settings)
  - Invalid credentials
  - Email already exists (for signup)

### If redirect doesn't work:
- Check console for navigation errors
- Verify user.role is "student" or "teacher"
- Check AuthContext login/signup functions

---

## 📝 Next Steps (Future)

### Google OAuth Integration:
1. Create Google Cloud Console project
2. Enable Google Sign-In API
3. Get OAuth Client ID
4. Update `AuthModal.tsx` Google button
5. Add backend endpoint handler for Google tokens

### Additional Features:
- Password reset/forgot password
- Email verification
- Profile editing
- Teacher dashboard (separate from student)
- Role switching UI

---

## 🎯 Current Limitations

- ✅ Email/Password auth works
- ⏳ Google OAuth is placeholder only
- ✅ Student and Teacher share same dashboard (can customize later)
- ✅ No email verification (can add later)
- ✅ No password reset (can add later)

---

## 🐛 Common Errors & Solutions

### "Import 'useAuth' could not be resolved"
→ TypeScript catching up, run: `npm install`

### "CORS error"
→ Backend CORS is set for `http://localhost:5173`, ensure frontend runs on that port

### "401 Unauthorized"
→ Token expired or invalid, logout and login again

### Modal styling broken
→ Ensure Tailwind CSS is properly configured

---

Ready to test! Let me know if you encounter any issues. 🚀
