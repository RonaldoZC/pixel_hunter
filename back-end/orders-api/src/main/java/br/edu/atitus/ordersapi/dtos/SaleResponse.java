package br.edu.atitus.ordersapi.dtos;

import br.edu.atitus.ordersapi.entities.OrderItemEntity;

import java.math.BigDecimal;

/** Uma venda: um item de pedido do ponto de vista do vendedor. O comprador não é exposto. */
public record SaleResponse(
        Long orderId,
        String orderNumber,
        Long assetId,
        String title,
        BigDecimal price,
        String soldAt
) {
    public static SaleResponse fromEntity(OrderItemEntity e) {
        var order = e.getOrder();
        return new SaleResponse(
                order.getId(),
                OrderResponse.number(order.getId()),
                e.getAssetId(),
                e.getTitle(),
                e.getPrice(),
                order.getCreatedAt().toString()); // ISO-8601 em UTC
    }
}
