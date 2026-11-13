package br.edu.atitus.productapi.repositories;

import br.edu.atitus.productapi.entities.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<CategoryEntity, String> {

    List<CategoryEntity> findAllByOrderByNameAsc();
}
