import { toApiId, toAppId } from './apiIds';
import { request } from './httpClient';
import { fetchAll } from './pagination';

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

export async function createOrder(items) {
  const order = await request('/ws/orders', {
    method: 'POST',
    auth: true,
    body: { items: items.map((item) => ({ assetId: toApiId(item.id) })) },
  });
  return toOrder(order);
}

export async function getOrders() {
  return fetchAll('/ws/orders', toOrder, { auth: true });
}

export async function getOrderById(id) {
  return toOrder(await request(`/ws/orders/${encodeURIComponent(id)}`, { auth: true }));
}
