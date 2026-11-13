package br.edu.atitus.productapi.dtos;

import br.edu.atitus.productapi.entities.ProductEntity;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        String categoryId,
        String imageUrl,
        Long sellerId
) {
    public static ProductResponse fromEntity(ProductEntity e) {
        return new ProductResponse(e.getId(), e.getTitle(), e.getDescription(), e.getPrice(),
                e.getCategoryId(), e.getImageUrl(), e.getSellerId());
    }
}
