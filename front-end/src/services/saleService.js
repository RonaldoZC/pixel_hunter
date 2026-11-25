import { toAppId } from './apiIds';
import { fetchAll } from './pagination';

function toSale(dto) {
  return {
    id: `${dto.orderId}-${dto.assetId}`,
    orderNumber: dto.orderNumber,
    assetId: toAppId(dto.assetId),
    title: dto.title,
    price: Number(dto.price),
    soldAt: dto.soldAt,
  };
}

export async function getSales() {
  return fetchAll('/ws/sales', toSale, { auth: true });
}
