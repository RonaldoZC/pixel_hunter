import { toAppId } from './apiIds';
import { fetchAllPages } from './pagination';

// Venda da API (item de pedido visto pelo vendedor) -> venda do app. O comprador não é exposto.
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

// Histórico de vendas do vendedor logado, da mais recente para a mais antiga.
export async function getSales() {
  return (await fetchAllPages('/ws/sales', { auth: true })).map(toSale);
}
