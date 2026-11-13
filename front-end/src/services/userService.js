import { toAppId } from './apiIds';
import { request } from './httpClient';

// Converte o usuário da API para o formato usado no app.
export function toUser(dto) {
  return {
    id: toAppId(dto.id),
    username: dto.username,
    email: dto.email,
    link: dto.link ?? '',
    photoUrl: dto.photoUrl ?? null,
    role: dto.role,
  };
}

export async function getMe() {
  return toUser(await request('/ws/users/me', { auth: true }));
}

// `link` é opcional: vazio vira ausente.
export async function updateMe({ username, email, link }) {
  const body = { username: username.trim(), email: email.trim() };
  if (link.trim()) body.link = link.trim();
  return toUser(await request('/ws/users/me', { method: 'PUT', body, auth: true }));
}

// `photoUrl` vem do upload em mediaService.
export async function updatePhoto(photoUrl) {
  return toUser(await request('/ws/users/me/photo', { method: 'PUT', body: { photoUrl }, auth: true }));
}
