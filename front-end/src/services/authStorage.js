// Guarda a sessão (token e usuário). No celular usa o armazenamento seguro do sistema;
// no web (onde ele não existe) mantém só em memória, e a sessão termina ao recarregar.
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'pixelhunter.session';
let memory = null;

export async function saveSession(session) {
  const text = JSON.stringify(session);
  if (Platform.OS === 'web') {
    memory = text;
    return;
  }
  await SecureStore.setItemAsync(KEY, text);
}

// Devolve { token, user } ou null; qualquer problema de leitura vira "sem sessão".
export async function loadSession() {
  try {
    const text = Platform.OS === 'web' ? memory : await SecureStore.getItemAsync(KEY);
    const session = text ? JSON.parse(text) : null;
    return session?.token && session?.user ? session : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  memory = null;
  if (Platform.OS === 'web') return;
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Sem o que apagar: a sessão já está limpa.
  }
}
