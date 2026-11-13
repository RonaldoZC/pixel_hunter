import { Platform } from 'react-native';

import { UPLOAD_TIMEOUT_MS } from '../config/env';
import { request } from './httpClient';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSION_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };

function typeOf(image) {
  if (image.mimeType) return image.mimeType;
  const extension = image.uri.split('?')[0].split('.').pop()?.toLowerCase();
  return EXTENSION_TYPES[extension] ?? 'image/jpeg';
}

// O FormData do React Native aceita { uri, name, type }; no web precisa de um Blob.
async function buildFormData(image, type) {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const blob = image.file ?? (await (await fetch(image.uri)).blob());
    formData.append('file', blob, image.fileName ?? 'imagem');
  } else {
    const name = image.fileName ?? `imagem.${type.split('/')[1]}`;
    formData.append('file', { uri: image.uri, name, type });
  }
  return formData;
}

// Envia a imagem escolhida na galeria (resultado do ImageField) e devolve a URL pública.
export async function uploadImage(image) {
  const type = typeOf(image);
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error('Formato de imagem não aceito. Use PNG, JPG ou WebP.');
  }
  if (image.fileSize && image.fileSize > MAX_BYTES) {
    throw new Error('A imagem é grande demais. O máximo é 5 MB.');
  }

  const result = await request('/ws/media', {
    method: 'POST',
    formData: await buildFormData(image, type),
    auth: true,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
  return result.url;
}
