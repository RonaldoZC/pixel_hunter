import { toAppId } from './apiIds';
import { request } from './httpClient';

export function toUser(dto) {
  return {
    id: toAppId(dto.id),
    username: dto.username,
    email: dto.email,
    link: dto.link ?? '',
    photoUrl: dto.photoUrl ?? undefined,
    role: dto.role,
  };
}

export async function getMe() {
  return toUser(await request('/ws/users/me', { auth: true }));
}

export async function updateMe({ username, email, link }) {
  const body = { username: username.trim(), email: email.trim() };
  if (link.trim()) body.link = link.trim();
  return toUser(await request('/ws/users/me', { method: 'PUT', body, auth: true }));
}

export async function updatePhoto(photoUrl) {
  return toUser(await request('/ws/users/me/photo', { method: 'PUT', body: { photoUrl }, auth: true }));
}
