package br.edu.atitus.ordersapi.clients;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

/** Os campos do produto que o pedido precisa. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductSnapshot(Long id, String title, BigDecimal price) {
}
