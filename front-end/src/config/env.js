// Configuração lida do ambiente. Variáveis EXPO_PUBLIC_* ficam visíveis dentro do app:
// nunca coloque segredos nelas. Defina em .env.local (ver .env.example).

// Tempo máximo de espera por uma resposta comum e por um envio de arquivo.
export const REQUEST_TIMEOUT_MS = 10000;
export const UPLOAD_TIMEOUT_MS = 30000;

// URL base da API (gateway), sem barra no final. Lida só quando alguém faz uma requisição,
// para que a falta da variável apareça como erro na tela e não derrube o app ao abrir.
export function getApiUrl() {
  // O Expo troca process.env.EXPO_PUBLIC_API_URL pelo valor na compilação: não use desestruturação.
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      'URL da API não configurada. Defina EXPO_PUBLIC_API_URL em .env.local e reinicie o Expo.'
    );
  }
  return url.replace(/\/+$/, '');
}
