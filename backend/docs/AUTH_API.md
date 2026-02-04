# Authentication API Documentation

## Overview

The Murph Learning Platform now includes production-grade authentication with:
- ✅ Email/Password signup and login
- ✅ Google OAuth integration
- ✅ JWT token-based authentication
- ✅ Role-based user profiles (student/teacher)
- ✅ Protected endpoints with middleware
- ✅ Supabase Auth integration

---

## Authentication Endpoints

### 1. **Signup (Email/Password)**

**Endpoint:** `POST /auth/signup`

**Description:** Register a new user with email, password, name, and role

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "student"  // or "teacher"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "token_type": "bearer"
  },
  "message": "Account created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or email already exists
- Validation errors for password (min 8 chars), email format, etc.

---

### 2. **Login (Email/Password)**

**Endpoint:** `POST /auth/login`

**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student",
    "is_active": true,
    "created_at": "2026-02-04T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "token_type": "bearer"
  },
  "message": "Login successful"
}
```

**Frontend Routing Logic:**
```javascript
// After successful login, route based on user.role:
if (response.user.role === "student") {
  navigate("/student-dashboard");
} else if (response.user.role === "teacher") {
  navigate("/teacher-dashboard");
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid email or password

---

### 3. **Google OAuth Login**

**Endpoint:** `POST /auth/google`

**Description:** Login/signup with Google OAuth token

**Request Body:**
```json
{
  "google_token": "ya29.a0AfH6SMB..."
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "john@gmail.com",
    "name": "John Doe",
    "role": "student",  // Default for new OAuth users
    "is_active": true,
    "created_at": "2026-02-04T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "token_type": "bearer"
  },
  "message": "Google login successful",
  "is_new_user": true  // Use this to show onboarding
}
```

**Note:** First-time Google users default to "student" role. Show role selection in onboarding if `is_new_user: true`.

---

### 4. **Get Current User**

**Endpoint:** `GET /auth/me`

**Description:** Get authenticated user's profile

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "student",
  "is_active": true,
  "created_at": "2026-02-04T10:00:00Z",
  "wallet_address": null
}
```

**Error Responses:**
- `401 Unauthorized` - Missing, invalid, or expired token

---

### 5. **Logout**

**Endpoint:** `POST /auth/logout`

**Description:** Logout and invalidate session

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### 6. **Update User Role**

**Endpoint:** `POST /auth/update-role`

**Description:** Change user role (student ↔ teacher)

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Request Body:**
```json
{
  "new_role": "teacher"
}
```

**Response (200 OK):**
```json
{
  "message": "Role updated to teacher"
}
```

**Note:** Automatically creates teacher profile when upgrading to teacher.

---

## Protected Endpoints

All endpoints below require `Authorization: Bearer <token>` header.

### User Validation Rules:
- ✅ Users can only access their own resources
- ✅ Wallet operations restricted to owner
- ✅ Session operations restricted to owner
- ❌ 403 Forbidden if accessing other user's data

### Example Protected Endpoints:

**Wallet Balance:**
```
GET /wallet/{user_id}
Authorization: Bearer <token>
```

**Start Video Session:**
```
POST /session/start
Authorization: Bearer <token>
Body: { "user_id": "same-as-token-user-id", "video_id": "abc123" }
```

---

## Frontend Integration Guide

### 1. **Store Tokens**
```javascript
// After login/signup:
localStorage.setItem('access_token', response.session.access_token);
localStorage.setItem('refresh_token', response.session.refresh_token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### 2. **Add Token to Requests**
```javascript
const token = localStorage.getItem('access_token');

fetch('http://localhost:8000/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. **Role-Based Routing**
```javascript
const user = JSON.parse(localStorage.getItem('user'));

// Redirect based on role
if (user.role === 'student') {
  navigate('/student-dashboard');
} else if (user.role === 'teacher') {
  navigate('/teacher-dashboard');
}
```

### 4. **Protected Route Wrapper**
```javascript
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

---

## Testing with cURL

### Signup:
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User",
    "role": "student"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### Get Current User:
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Features

✅ **Password Requirements:**
- Minimum 8 characters
- Validated by Pydantic

✅ **JWT Token Verification:**
- All protected routes verify token
- Automatic expiration handling

✅ **User Isolation:**
- Users can only access their own resources
- 403 Forbidden for unauthorized access

✅ **Supabase Auth Integration:**
- Industry-standard authentication
- Built-in session management
- Secure token storage

---

## Next Steps for Frontend

1. Create Login page (`/login`)
2. Create Signup page (`/signup`)
3. Add Google OAuth button integration
4. Create AuthContext for state management
5. Add ProtectedRoute wrapper
6. Update VideoPlayer to use authenticated user
7. Add role-based navigation after login

---

## Database Schema

**Users table automatically includes:**
- `id` (UUID, from Supabase Auth)
- `email` (unique)
- `name`
- `role` (student/teacher)
- `is_active`
- `wallet_address` (optional)
- `created_at`, `updated_at`

**Teachers table (auto-created for teacher role):**
- `user_id` (FK to users)
- `bio`
- `expertise_areas`
- `average_rating`
- `total_earnings`
- `is_verified`

---

## Common Errors & Solutions

**401 Unauthorized:**
- Check token exists and is valid
- Token might be expired - re-login needed

**403 Forbidden:**
- User trying to access another user's resources
- Check user_id matches authenticated user

**400 Bad Request:**
- Invalid input data
- Email already exists
- Password too short

---

Ready to test! 🚀
