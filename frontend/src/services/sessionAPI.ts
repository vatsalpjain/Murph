/**
 * Session API Service - Frontend
 * Handles all session-related API calls to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SessionCreateRequest {
  course_id: string;
  student_id: string;
  locked_amount: number;
}

export interface SessionCreateResponse {
  session_id: string;
  status: string;
  locked_amount: number;
  payment_tx_id: string;
  created_at: string;
}

export interface SessionMetricsUpdate {
  duration_seconds: number;
  completion_pct: number;
  current_lecture?: number;
}

export interface SessionMetricsResponse {
  session_id: string;
  duration_seconds: number;
  completion_pct: number;
  current_lecture: number | null;
  final_cost: number;
  updated_at: string;
}

export interface SessionCompleteRequest {
  session_id: string;
  duration_seconds: number;
}

export interface SessionCompleteResponse {
  session_id: string;
  status: string;
  duration_seconds: number;
  final_cost: number;
  amount_paid: number;
  amount_refunded: number;
}

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  const authData = localStorage.getItem('auth');
  if (!authData) return null;
  
  try {
    const parsed = JSON.parse(authData);
    return parsed.session?.access_token || null;
  } catch {
    return null;
  }
};

/**
 * Create a new session with locked payment
 */
export const createSession = async (
  courseId: string,
  studentId: string,
  lockedAmount: number
): Promise<SessionCreateResponse> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/sessions/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      course_id: courseId,
      student_id: studentId,
      locked_amount: lockedAmount,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create session' }));
    throw new Error(error.detail || 'Failed to create session');
  }

  return response.json();
};

/**
 * Start a session (begin timer)
 */
export const startSession = async (sessionId: string): Promise<void> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to start session' }));
    throw new Error(error.detail || 'Failed to start session');
  }
};

/**
 * Update session metrics (called every 5 seconds during playback)
 */
export const updateSessionMetrics = async (
  sessionId: string,
  metrics: SessionMetricsUpdate
): Promise<SessionMetricsResponse> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/metrics`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(metrics),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update metrics' }));
    throw new Error(error.detail || 'Failed to update metrics');
  }

  return response.json();
};

/**
 * Complete a session (end video, settle payment)
 */
export const completeSession = async (
  sessionId: string,
  durationSeconds: number
): Promise<SessionCompleteResponse> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      session_id: sessionId,
      duration_seconds: durationSeconds,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to complete session' }));
    throw new Error(error.detail || 'Failed to complete session');
  }

  return response.json();
};

/**
 * Get session status
 */
export const getSessionStatus = async (sessionId: string): Promise<any> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get session status' }));
    throw new Error(error.detail || 'Failed to get session status');
  }

  return response.json();
};
