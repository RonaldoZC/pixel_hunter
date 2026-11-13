package br.edu.atitus.ordersapi.dtos;

import br.edu.atitus.ordersapi.entities.OrderItemEntity;

import java.math.BigDecimal;

public record OrderItemResponse(Long assetId, String title, BigDecimal price) {

    public static OrderItemResponse fromEntity(OrderItemEntity e) {
        return new OrderItemResponse(e.getAssetId(), e.getTitle(), e.getPrice());
    }
}
