package br.edu.atitus.ordersapi.services;

import br.edu.atitus.ordersapi.clients.ProductCatalog;
import br.edu.atitus.ordersapi.clients.ProductSnapshot;
import br.edu.atitus.ordersapi.dtos.CreateOrderRequest;
import br.edu.atitus.ordersapi.dtos.OrderResponse;
import br.edu.atitus.ordersapi.entities.OrderEntity;
import br.edu.atitus.ordersapi.entities.OrderItemEntity;
import br.edu.atitus.ordersapi.entities.OrderStatus;
import br.edu.atitus.ordersapi.exceptions.ApiException;
import br.edu.atitus.ordersapi.repositories.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class OrderService {

    static final int MAX_ITEMS = 50;

    private final OrderRepository repository;
    private final ProductCatalog catalog;

    public OrderService(OrderRepository repository, ProductCatalog catalog) {
        this.repository = repository;
        this.catalog = catalog;
    }

    /**
     * Cria o pedido. As chamadas ao product-api acontecem ANTES de abrir a transação do banco,
     * e os preços vêm sempre do servidor: o cliente só informa quais assets quer.
     */
    public OrderResponse create(Long buyerId, CreateOrderRequest request) {
        List<Long> ids = validatedIds(request);

        List<ProductSnapshot> products = new ArrayList<>();
        for (Long id : ids) {
            products.add(catalog.findById(id));
        }

        var order = new OrderEntity();
        order.setBuyerId(buyerId);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setCreatedAt(Instant.now());
        for (ProductSnapshot product : products) {
            var item = new OrderItemEntity();
            item.setAssetId(product.id());
            item.setTitle(product.title());
            item.setPrice(product.price().setScale(2, RoundingMode.HALF_UP));
            item.setSellerId(product.sellerId());
            order.addItem(item);
        }
        order.setTotal(total(order.getItems().stream().map(OrderItemEntity::getPrice).toList()));

        return OrderResponse.fromEntity(repository.save(order));
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> list(Long buyerId, Pageable pageable) {
        return repository.findByBuyerId(buyerId, pageable).map(OrderResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderResponse get(Long id, Long buyerId) {
        var order = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));
        if (!order.getBuyerId().equals(buyerId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Você não tem acesso a este pedido.");
        }
        return OrderResponse.fromEntity(order);
    }

    /** Soma em BigDecimal (sem erro de ponto flutuante). */
    static BigDecimal total(List<BigDecimal> prices) {
        return prices.stream().reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
    }

    private static List<Long> validatedIds(CreateOrderRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw badRequest("O pedido precisa ter ao menos um item.");
        }
        if (request.items().size() > MAX_ITEMS) {
            throw badRequest("O pedido pode ter no máximo " + MAX_ITEMS + " itens.");
        }
        List<Long> ids = new ArrayList<>();
        Set<Long> seen = new HashSet<>();
        for (var item : request.items()) {
            Long id = item == null ? null : item.assetId();
            if (id == null || id <= 0) throw badRequest("Item inválido: informe o assetId.");
            if (!seen.add(id)) throw badRequest("Item duplicado no pedido: " + id + ".");
            ids.add(id);
        }
        return ids;
    }

    private static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
