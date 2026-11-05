import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from './mockAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // The server never knows the session; it is restored once the page is in the browser.
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restored = api.restoreSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser-only storage after hydration
    if (restored) setSession(restored);
    setReady(true);
  }, []);

  const login = useCallback(async (email, password) => {
    const s = await api.login(email, password);
    setSession(s);
    return s.user;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setSession(null);
  }, []);

  const value = useMemo(() => ({ user: session?.user ?? null, ready, login, logout }), [session, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
