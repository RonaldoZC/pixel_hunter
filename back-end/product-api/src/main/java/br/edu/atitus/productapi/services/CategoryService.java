package br.edu.atitus.productapi.services;

import br.edu.atitus.productapi.dtos.CategoryResponse;
import br.edu.atitus.productapi.repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<CategoryResponse> findAll() {
        return repository.findAllByOrderByNameAsc().stream().map(CategoryResponse::fromEntity).toList();
    }
}
