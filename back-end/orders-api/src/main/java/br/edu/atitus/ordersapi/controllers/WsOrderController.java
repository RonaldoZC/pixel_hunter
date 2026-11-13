package br.edu.atitus.ordersapi.controllers;

import br.edu.atitus.ordersapi.dtos.CreateOrderRequest;
import br.edu.atitus.ordersapi.dtos.OrderResponse;
import br.edu.atitus.ordersapi.security.CurrentUser;
import br.edu.atitus.ordersapi.services.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Pedidos do comprador. O gateway valida o JWT; aqui validamos o perfil BUYER e o dono. */
@RestController
@RequestMapping("/ws/orders")
public class WsOrderController {

    private static final String USER_ID = "X-User-Id";
    private static final String USER_TYPE = "X-User-Type";
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final OrderService service;

    public WsOrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @RequestHeader(value = USER_ID, required = false) String userId,
            @RequestHeader(value = USER_TYPE, required = false) String userType,
            @RequestBody CreateOrderRequest request) {
        var user = CurrentUser.from(userId, userType).requireRole(CurrentUser.BUYER);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(user.id(), request));
    }

    @GetMapping
    public Page<OrderResponse> list(
            @RequestHeader(value = USER_ID, required = false) String userId,
            @RequestHeader(value = USER_TYPE, required = false) String userType,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        var user = CurrentUser.from(userId, userType).requireRole(CurrentUser.BUYER);
        return service.list(user.id(), pageable(page, size));
    }

    @GetMapping("/{id}")
    public OrderResponse get(
            @PathVariable Long id,
            @RequestHeader(value = USER_ID, required = false) String userId,
            @RequestHeader(value = USER_TYPE, required = false) String userType) {
        var user = CurrentUser.from(userId, userType).requireRole(CurrentUser.BUYER);
        return service.get(id, user.id());
    }

    /** Mais recentes primeiro. */
    private static Pageable pageable(Integer page, Integer size) {
        int p = page == null ? 0 : Math.max(page, 0);
        int s = size == null ? DEFAULT_SIZE : Math.min(Math.max(size, 1), MAX_SIZE);
        return PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
    }
}
