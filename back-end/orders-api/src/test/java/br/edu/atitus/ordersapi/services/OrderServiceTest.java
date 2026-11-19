package br.edu.atitus.ordersapi.services;

import br.edu.atitus.ordersapi.clients.ProductCatalog;
import br.edu.atitus.ordersapi.clients.ProductSnapshot;
import br.edu.atitus.ordersapi.dtos.CreateOrderRequest;
import br.edu.atitus.ordersapi.entities.OrderEntity;
import br.edu.atitus.ordersapi.exceptions.ApiException;
import br.edu.atitus.ordersapi.repositories.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    private OrderRepository repository;
    private OrderService service;

    private final Map<Long, ProductSnapshot> products = Map.of(
            1L, new ProductSnapshot(1L, "Troll Mutante", new BigDecimal("19.90"), 7L),
            2L, new ProductSnapshot(2L, "Castelo Modular", new BigDecimal("39.90"), 7L));

    private final ProductCatalog catalog = id -> {
        var p = products.get(id);
        if (p == null) throw new ApiException(HttpStatus.NOT_FOUND, "Produto " + id + " não encontrado.");
        return p;
    };

    private static CreateOrderRequest request(Long... ids) {
        return new CreateOrderRequest(java.util.Arrays.stream(ids).map(CreateOrderRequest.Item::new).toList());
    }

    @BeforeEach
    void setUp() {
        repository = mock(OrderRepository.class);
        service = new OrderService(repository, catalog);
        when(repository.save(any(OrderEntity.class))).thenAnswer(inv -> {
            OrderEntity saved = inv.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(saved, "id", 123L); // o banco define o id
            return saved;
        });
    }

    @Test
    void totalIsSumOfServerPrices() {
        assertEquals(new BigDecimal("59.80"), OrderService.total(List.of(new BigDecimal("19.90"), new BigDecimal("39.90"))));
        assertEquals(new BigDecimal("0.30"), OrderService.total(List.of(new BigDecimal("0.10"), new BigDecimal("0.20"))));
    }

    @Test
    void createUsesCatalogTitleAndPrice() {
        var captor = org.mockito.ArgumentCaptor.forClass(OrderEntity.class);
        var response = service.create(9L, request(1L, 2L));
        assertEquals("PH-000123", response.number());
        assertEquals("CONFIRMED", response.status());
        verify(repository).save(captor.capture());
        var saved = captor.getValue();
        assertEquals(9L, saved.getBuyerId());
        assertEquals(new BigDecimal("59.80"), saved.getTotal());
        assertEquals(2, saved.getItems().size());
        assertEquals("Troll Mutante", saved.getItems().get(0).getTitle());
    }

    @Test
    void rejectsEmptyDuplicateAndUnknownItems() {
        assertEquals(HttpStatus.BAD_REQUEST,
                assertThrows(ApiException.class, () -> service.create(9L, request())).getStatus());
        assertEquals(HttpStatus.BAD_REQUEST,
                assertThrows(ApiException.class, () -> service.create(9L, request(1L, 1L))).getStatus());
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(ApiException.class, () -> service.create(9L, request(1L, 99L))).getStatus());
        verify(repository, never()).save(any(OrderEntity.class));
    }

    @Test
    void getRejectsOtherBuyersAndMissingOrders() {
        var order = new OrderEntity();
        order.setBuyerId(1L);
        when(repository.findById(5L)).thenReturn(Optional.of(order));
        when(repository.findById(6L)).thenReturn(Optional.empty());

        assertEquals(HttpStatus.FORBIDDEN,
                assertThrows(ApiException.class, () -> service.get(5L, 2L)).getStatus());
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(ApiException.class, () -> service.get(6L, 2L)).getStatus());
    }
}
