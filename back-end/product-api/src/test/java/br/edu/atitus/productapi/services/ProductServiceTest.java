package br.edu.atitus.productapi.services;

import br.edu.atitus.productapi.dtos.ProductRequest;
import br.edu.atitus.productapi.entities.CategoryEntity;
import br.edu.atitus.productapi.entities.ProductEntity;
import br.edu.atitus.productapi.exceptions.ApiException;
import br.edu.atitus.productapi.repositories.CategoryRepository;
import br.edu.atitus.productapi.repositories.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    private ProductRepository repository;
    private CategoryRepository categoryRepository;
    private ProductService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProductRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        service = new ProductService(repository, categoryRepository);
        when(categoryRepository.findById("criaturas")).thenReturn(Optional.of(new CategoryEntity("criaturas", "Criaturas")));
        when(repository.save(any(ProductEntity.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private ProductRequest request(String price, String categoryId) {
        return new ProductRequest("Troll Mutante", "Sprite animado", price == null ? null : new BigDecimal(price),
                categoryId, "https://cdn.exemplo.com/troll.png");
    }

    @Test
    void createSetsSellerAndSearchText() {
        var response = service.create(5L, request("19.9", "criaturas"));
        assertEquals(5L, response.sellerId());
        assertEquals(new BigDecimal("19.90"), response.price());
        var captor = org.mockito.ArgumentCaptor.forClass(ProductEntity.class);
        verify(repository).save(captor.capture());
        assertEquals("troll mutante sprite animado criaturas", captor.getValue().getSearchText());
    }

    @Test
    void rejectsNonPositivePrice() {
        var ex = assertThrows(ApiException.class, () -> service.create(5L, request("0", "criaturas")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void rejectsUnknownCategory() {
        var ex = assertThrows(ApiException.class, () -> service.create(5L, request("10", "inexistente")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void onlyOwnerCanUpdateOrDelete() {
        var product = new ProductEntity();
        product.setSellerId(1L);
        when(repository.findById(10L)).thenReturn(Optional.of(product));

        var update = assertThrows(ApiException.class, () -> service.update(10L, 2L, request("10", "criaturas")));
        assertEquals(HttpStatus.FORBIDDEN, update.getStatus());
        var delete = assertThrows(ApiException.class, () -> service.delete(10L, 2L));
        assertEquals(HttpStatus.FORBIDDEN, delete.getStatus());
        verify(repository, never()).delete(any(ProductEntity.class));

        service.delete(10L, 1L);
        verify(repository).delete(product);
    }

    @Test
    void missingProductIsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        var ex = assertThrows(ApiException.class, () -> service.findById(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("Produto não encontrado", ex.getMessage());
    }
}
