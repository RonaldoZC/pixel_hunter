import { toApiId, toAppId } from './apiIds';
import { request } from './httpClient';
import { fetchAllPages } from './pagination';

// Pedido da API -> pedido do app.
function toOrder(dto) {
  return {
    id: toAppId(dto.id),
    number: dto.number,
    createdAt: dto.createdAt,
    total: Number(dto.total),
    status: dto.status,
    items: (dto.items ?? []).map((item) => ({
      assetId: toAppId(item.assetId),
      title: item.title,
      price: Number(item.price),
    })),
  };
}

// Cria o pedido a partir dos itens do carrinho ({ id }). O preço é o do servidor.
export async function createOrder(items) {
  const order = await request('/ws/orders', {
    method: 'POST',
    auth: true,
    body: { items: items.map((item) => ({ assetId: toApiId(item.id) })) },
  });
  return toOrder(order);
}

export async function getOrders() {
  return (await fetchAllPages('/ws/orders', { auth: true })).map(toOrder);
}

// Pedido do usuário logado, com os itens. A API responde 404 se não existir e 403 se for de outro usuário.
export async function getOrderById(id) {
  return toOrder(await request(`/ws/orders/${encodeURIComponent(id)}`, { auth: true }));
}
