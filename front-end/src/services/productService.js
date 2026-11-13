import { toApiId } from './apiIds';
import { toAsset } from './assetService';
import { request } from './httpClient';
import { uploadImage } from './mediaService';
import { fetchAllPages } from './pagination';
import { parsePrice } from '../utils/validators';

// Imagem já publicada (vinda da API) é marcada com `remote: true` e não é enviada de novo;
// uma imagem nova, escolhida na galeria, vai primeiro para o media-api.
async function resolveImageUrl(image) {
  return image.remote ? image.uri : uploadImage(image);
}

// `form` é o formulário da tela: { title, description, price, categoryId, image }.
async function buildBody(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    price: parsePrice(form.price),
    categoryId: toApiId(form.categoryId),
    imageUrl: await resolveImageUrl(form.image),
  };
}

// Publica um produto (conta de vendedor).
export async function createProduct(form) {
  return toAsset(await request('/ws/products', { method: 'POST', auth: true, body: await buildBody(form) }));
}

// Edita um produto do próprio vendedor.
export async function updateProduct(id, form) {
  return toAsset(
    await request(`/ws/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      auth: true,
      body: await buildBody(form),
    })
  );
}

export async function deleteProduct(id) {
  await request(`/ws/products/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
}

// Produtos do vendedor logado, no mesmo formato dos assets da loja.
export async function getMyProducts() {
  return (await fetchAllPages('/ws/products/mine', { auth: true })).map(toAsset);
}

// Formulário preenchido com um produto existente (tela de edição).
export function productToForm(asset) {
  return {
    title: asset.title,
    description: asset.description,
    price: String(asset.price).replace('.', ','),
    categoryId: asset.categoryId,
    image: asset.image ? { uri: asset.image.uri, remote: true } : null,
  };
}
