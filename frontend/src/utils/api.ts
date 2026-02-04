/**
 * API Client Utility
 * Automatically includes authentication tokens in all backend requests
 */

const BACKEND_URL = 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const session = localStorage.getItem('session');
    
    if (session) {
      try {
        const { access_token } = JSON.parse(session);
        return {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        };
      } catch (error) {
        console.error('Failed to parse session:', error);
      }
    }
    
    return {
      'Content-Type': 'application/json',
    };
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    const { requiresAuth = true, headers, ...restOptions } = options;
    
    const finalHeaders = requiresAuth
      ? { ...this.getAuthHeaders(), ...headers }
      : { 'Content-Type': 'application/json', ...headers };

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...restOptions,
      headers: finalHeaders,
    });

    // Note: 401 handling is done by AuthContext, not here
    // This prevents inconsistent redirect behavior (window.location vs navigate)

    return response;
  }

  async get(endpoint: string, options?: RequestOptions): Promise<Response> {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, data?: any, options?: RequestOptions): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data?: any, options?: RequestOptions): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string, options?: RequestOptions): Promise<Response> {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export { BACKEND_URL };
