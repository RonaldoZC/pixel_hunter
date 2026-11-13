import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { signIn as signInRequest } from '../services/authService';
import { clearSession, loadSession, saveSession } from '../services/authStorage';
import { configureHttpClient } from '../services/httpClient';

// Sessão do usuário: { user, token }. O token fica no armazenamento seguro e é lido ao abrir o app.
// O cliente HTTP recebe daqui o token e o aviso de sessão expirada (401 em rota logada).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const tokenRef = useRef(null);

  const applySession = useCallback((next) => {
    tokenRef.current = next?.token ?? null;
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    applySession(null);
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

  // Atualiza o usuário guardado depois de editar o perfil.
  const updateUser = useCallback(
    (user) => {
      const next = { ...session, user };
      applySession(next);
      saveSession(next);
    },
    [session, applySession]
  );

  const value = useMemo(() => {
    const user = session?.user ?? null;
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
