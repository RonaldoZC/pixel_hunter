import { request } from './httpClient';
import { toUser } from './userService';

// role: 'BUYER' (comprador) ou 'SELLER' (vendedor).
export async function signUp({ username, email, password, role }) {
  await request('/auth/signup', {
    method: 'POST',
    body: { username: username.trim(), email: email.trim(), password, role },
  });
}

// Devolve { user, token }. Credenciais erradas chegam como ApiError com a mensagem da API.
export async function signIn({ email, password }) {
  const result = await request('/auth/signin', {
    method: 'POST',
    body: { email: email.trim(), password },
  });
  return { user: toUser(result.user), token: result.token };
}
