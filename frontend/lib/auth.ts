export interface User {
  id: string;
  email: string;
  role: string;
  companyId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token');
  },
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth-user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setAuth: (token: string, user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth-token', token);
    localStorage.setItem('auth-user', JSON.stringify(user));
  },
  clearAuth: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  },
  isAuthenticated: (): boolean => {
    return authStorage.getToken() !== null;
  },
};

