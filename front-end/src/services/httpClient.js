// Único ponto de acesso HTTP do app: monta a URL, envia o token, aplica timeout e converte
// qualquer falha em ApiError com mensagem pronta para o usuário.
import { getApiUrl, REQUEST_TIMEOUT_MS } from '../config/env';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// O AuthContext registra aqui como obter o token e o que fazer quando a sessão expira.
let getToken = () => null;
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

// Lê o corpo como JSON quando possível; o back-end às vezes responde texto puro.
async function readBody(response) {
  const text = await response.text();
  if (!text) return null;
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

// Opções: method, query (objeto), body (JSON), formData (multipart), auth (envia o token) e
// timeoutMs. Em multipart não definimos Content-Type: o fetch coloca o boundary sozinho.
export async function request(path, { method = 'GET', query, body, formData, auth = false, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const headers = { Accept: 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof ApiError || error.message?.startsWith('URL da API')) throw error;
    throw new ApiError(
      error.name === 'AbortError'
        ? 'O servidor demorou demais para responder. Tente de novo.'
        : 'Não foi possível conectar ao servidor. Verifique sua conexão e a URL da API.'
    );
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
