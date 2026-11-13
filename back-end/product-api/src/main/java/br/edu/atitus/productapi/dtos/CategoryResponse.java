package br.edu.atitus.productapi.dtos;

import br.edu.atitus.productapi.entities.CategoryEntity;

public record CategoryResponse(String id, String name) {

    public static CategoryResponse fromEntity(CategoryEntity e) {
        return new CategoryResponse(e.getId(), e.getName());
    }
}
