// Acesso aos assets (produtos da API). Converte o formato da API para o que as telas usam.
import { toAppId } from './apiIds';
import { ApiError, request } from './httpClient';
import { fetchAllPages } from './pagination';

// Produto da API -> asset do app. `image` já no formato de fonte do React Native.
export function toAsset(dto) {
  return {
    id: toAppId(dto.id),
    title: dto.title,
    categoryId: toAppId(dto.categoryId),
    price: Number(dto.price),
    description: dto.description ?? '',
    image: dto.imageUrl ? { uri: dto.imageUrl } : null,
  };
}

// Filtro por categoria e texto é feito pelo servidor (a busca ignora acentos e maiúsculas).
export async function getAssets({ categoryId, query } = {}) {
  const products = await fetchAllPages('/products', {
    query: { categoryId, query: query?.trim() },
  });
  return products.map(toAsset);
}

export async function getAssetById(id) {
  try {
    return toAsset(await request(`/products/${encodeURIComponent(id)}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Error('Asset não encontrado.');
    }
    throw error;
  }
}
