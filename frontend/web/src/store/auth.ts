import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  role: string | null;
  setAuth: (token: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      setAuth: (token, role) => {
        localStorage.setItem('preventia_token', token);
        set({ token, role });
      },
      clearAuth: () => {
        localStorage.removeItem('preventia_token');
        set({ token: null, role: null });
      },
    }),
    { name: 'preventia-auth' }
  )
);
