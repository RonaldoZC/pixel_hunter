import { ConfigError } from '../errors';

export const REQUEST_TIMEOUT_MS = 10000;
export const UPLOAD_TIMEOUT_MS = 30000;

export function getApiUrl() {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new ConfigError(
      'URL da API não configurada. Defina EXPO_PUBLIC_API_URL em .env.local e reinicie o Expo.'
    );
  }
  return url.replace(/\/+$/, '');
}
