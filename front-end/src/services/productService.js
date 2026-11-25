import { parsePrice } from '../utils/validators';
import { toApiId } from './apiIds';
import { toAsset } from './assetService';
import { request } from './httpClient';
import { uploadImage } from './mediaService';
import { fetchAll } from './pagination';

async function resolveImageUrl(image) {
  return image.remote ? image.uri : uploadImage(image);
}

function toProductBody(form, imageUrl) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    price: parsePrice(form.price),
    categoryId: toApiId(form.categoryId),
    imageUrl,
  };
}

async function saveProduct(path, method, form) {
  const imageUrl = await resolveImageUrl(form.image);
  return toAsset(await request(path, { method, auth: true, body: toProductBody(form, imageUrl) }));
}

export function createProduct(form) {
  return saveProduct('/ws/products', 'POST', form);
}

export function updateProduct(id, form) {
  return saveProduct(`/ws/products/${encodeURIComponent(id)}`, 'PUT', form);
}

export async function deleteProduct(id) {
  await request(`/ws/products/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
}

export function getMyProducts() {
  return fetchAll('/ws/products/mine', toAsset, { auth: true });
}

export function productToForm(asset) {
  return {
    title: asset.title,
    description: asset.description,
    price: String(asset.price).replace('.', ','),
    categoryId: asset.categoryId,
    image: asset.image ? { uri: asset.image.uri, remote: true } : undefined,
  };
}
