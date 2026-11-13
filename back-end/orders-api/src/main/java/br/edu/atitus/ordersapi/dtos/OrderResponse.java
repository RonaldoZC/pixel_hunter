package br.edu.atitus.ordersapi.dtos;

import br.edu.atitus.ordersapi.entities.OrderEntity;

import java.math.BigDecimal;
import java.util.List;

public record OrderResponse(
        Long id,
        String number,
        String createdAt,
        BigDecimal total,
        String status,
        List<OrderItemResponse> items
) {
    public static OrderResponse fromEntity(OrderEntity e) {
        return new OrderResponse(
                e.getId(),
                number(e.getId()),
                e.getCreatedAt().toString(), // ISO-8601 em UTC, ex.: 2026-11-10T23:30:00Z
                e.getTotal(),
                e.getStatus().name(),
                e.getItems().stream().map(OrderItemResponse::fromEntity).toList());
    }

    /** Número exibido ao usuário, derivado do id: PH-000123. */
    public static String number(Long id) {
        return String.format("PH-%06d", id);
    }
}
