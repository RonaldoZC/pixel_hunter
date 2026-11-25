import { getApiUrl, REQUEST_TIMEOUT_MS } from '../config/env';
import { ApiError, ConfigError } from '../errors';

let getToken = () => '';
let onUnauthorized = () => {};

export function configureHttpClient(options) {
  getToken = options.getToken ?? getToken;
  onUnauthorized = options.onUnauthorized ?? onUnauthorized;
}

function buildUrl(path, query) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
  });
  const queryString = params.toString();
  return `${getApiUrl()}${path}${queryString ? `?${queryString}` : ''}`;
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(status, body, authenticated) {
  const fromBody = typeof body === 'string' ? body : body?.message;
  if (status === 401 && authenticated) return 'Sua sessão expirou. Entre novamente.';
  if (fromBody) return fromBody;
  if (status === 403) return 'Você não tem permissão para esta operação.';
  if (status === 404) return 'Não encontrado.';
  if (status >= 500) return 'O servidor teve um problema. Tente de novo em instantes.';
  return 'Não foi possível concluir a operação.';
}

function buildHeaders({ auth, hasJsonBody }) {
  const headers = { Accept: 'application/json' };
  const token = auth ? getToken() : '';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (hasJsonBody) headers['Content-Type'] = 'application/json';
  return headers;
}

function toNetworkError(error) {
  if (error instanceof ApiError || error instanceof ConfigError) return error;
  const message =
    error.name === 'AbortError'
      ? 'O servidor demorou demais para responder. Tente de novo.'
      : 'Não foi possível conectar ao servidor. Verifique sua conexão e a URL da API.';
  return new ApiError(message, 0, error);
}

export async function request(path, { method = 'GET', query, body, formData, auth = false, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const hasJsonBody = body !== undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: buildHeaders({ auth, hasJsonBody }),
      body: formData ?? (hasJsonBody ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (error) {
    throw toNetworkError(error);
  } finally {
    clearTimeout(timer);
  }

  const data = await readBody(response);
  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized();
    throw new ApiError(errorMessage(response.status, data, auth), response.status);
  }
  return data;
}
