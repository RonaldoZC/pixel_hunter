import { ApiError } from '../errors';
import { toAppId } from './apiIds';
import { request } from './httpClient';
import { fetchAll } from './pagination';

export function toAsset(dto) {
  return {
    id: toAppId(dto.id),
    title: dto.title,
    categoryId: toAppId(dto.categoryId),
    price: Number(dto.price),
    description: dto.description ?? '',
    image: dto.imageUrl ? { uri: dto.imageUrl } : undefined,
  };
}

export async function getAssets({ categoryId, query } = {}) {
  return fetchAll('/products', toAsset, { query: { categoryId, query: query?.trim() } });
}

export async function getAssetById(id) {
  try {
    return toAsset(await request(`/products/${encodeURIComponent(id)}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new ApiError('Asset não encontrado.', 404, error);
    }
    throw error;
  }
}
