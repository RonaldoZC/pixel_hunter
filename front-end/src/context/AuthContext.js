import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { signIn as signInRequest } from '../services/authService';
import { clearSession, loadSession, saveSession, SIGNED_OUT } from '../services/authStorage';
import { configureHttpClient } from '../services/httpClient';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(SIGNED_OUT);
  const [restoring, setRestoring] = useState(true);
  const tokenRef = useRef(SIGNED_OUT.token);

  const applySession = useCallback((next) => {
    tokenRef.current = next.token;
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    applySession(SIGNED_OUT);
    await clearSession();
  }, [applySession]);

  useEffect(() => {
    configureHttpClient({ getToken: () => tokenRef.current, onUnauthorized: signOut });
    loadSession().then((saved) => {
      applySession(saved);
      setRestoring(false);
    });
  }, [applySession, signOut]);

  const signIn = useCallback(
    async (credentials) => {
      const next = await signInRequest(credentials);
      await saveSession(next);
      applySession(next);
    },
    [applySession]
  );

  const updateUser = useCallback(
    (user) => {
      const next = { ...session, user };
      applySession(next);
      saveSession(next);
    },
    [session, applySession]
  );

  const value = useMemo(() => {
    const { user } = session;
    return {
      user,
      restoring,
      isBuyer: user?.role === 'BUYER',
      isSeller: user?.role === 'SELLER',
      signIn,
      signOut,
      updateUser,
    };
  }, [session, restoring, signIn, signOut, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
