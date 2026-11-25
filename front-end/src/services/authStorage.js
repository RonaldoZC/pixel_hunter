import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'pixelhunter.session';
let memory;

export const SIGNED_OUT = Object.freeze({ token: '', user: undefined });

export async function saveSession(session) {
  const text = JSON.stringify(session);
  if (Platform.OS === 'web') {
    memory = text;
    return;
  }
  await SecureStore.setItemAsync(KEY, text);
}

export async function loadSession() {
  try {
    const text = Platform.OS === 'web' ? memory : await SecureStore.getItemAsync(KEY);
    const session = text ? JSON.parse(text) : SIGNED_OUT;
    return session.token && session.user ? session : SIGNED_OUT;
  } catch (error) {
    console.warn('Não foi possível ler a sessão salva; seguindo sem login.', error);
    return SIGNED_OUT;
  }
}

export async function clearSession() {
  memory = undefined;
  if (Platform.OS === 'web') return;
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch (error) {
    console.warn('Não foi possível apagar a sessão salva.', error);
  }
}
