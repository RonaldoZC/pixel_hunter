package br.edu.atitus.productapi.dtos;

import java.math.BigDecimal;

public record ProductRequest(
        String title,
        String description,
        BigDecimal price,
        String categoryId,
        String imageUrl
) {
}
