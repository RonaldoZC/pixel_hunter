package br.edu.atitus.ordersapi.controllers;

import br.edu.atitus.ordersapi.dtos.SaleResponse;
import br.edu.atitus.ordersapi.security.CurrentUser;
import br.edu.atitus.ordersapi.services.SaleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Histórico de vendas do vendedor. O gateway valida o JWT; aqui validamos o perfil SELLER. */
@RestController
@RequestMapping("/ws/sales")
public class WsSaleController {

    private static final String USER_ID = "X-User-Id";
    private static final String USER_TYPE = "X-User-Type";
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final SaleService service;

    public WsSaleController(SaleService service) {
        this.service = service;
    }

    @GetMapping
    public Page<SaleResponse> list(
            @RequestHeader(value = USER_ID, required = false) String userId,
            @RequestHeader(value = USER_TYPE, required = false) String userType,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        var user = CurrentUser.from(userId, userType).requireRole(CurrentUser.SELLER);
        return service.list(user.id(), pageable(page, size));
    }

    /** Vendas mais recentes primeiro. */
    private static Pageable pageable(Integer page, Integer size) {
        int p = page == null ? 0 : Math.max(page, 0);
        int s = size == null ? DEFAULT_SIZE : Math.min(Math.max(size, 1), MAX_SIZE);
        return PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "order.createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
    }
}
