package br.edu.atitus.ordersapi.dtos;

import java.util.List;

/** O cliente envia só os ids: título e preço sempre vêm do product-api. */
public record CreateOrderRequest(List<Item> items) {

    public record Item(Long assetId) {
    }
}
