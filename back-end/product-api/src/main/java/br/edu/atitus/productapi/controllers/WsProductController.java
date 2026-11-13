package br.edu.atitus.productapi.controllers;

import br.edu.atitus.productapi.dtos.ProductRequest;
import br.edu.atitus.productapi.dtos.ProductResponse;
import br.edu.atitus.productapi.security.CurrentUser;
import br.edu.atitus.productapi.services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Rotas protegidas do vendedor. O gateway valida o JWT; aqui validamos o perfil e o dono. */
@RestController
@RequestMapping("/ws/products")
public class WsProductController {

    private static final String USER_ID = "X-User-Id";
    private static final String USER_TYPE = "X-User-Type";

    private final ProductService service;

    public WsProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @RequestHeader(value = USER_ID, required = false) String userId,
            @RequestHeader(value = USER_TYPE, required = false) String userType,
            @RequestBody ProductRequest request) {
        var user = CurrentUser.from(userId, userType).requireRole(CurrentUser.SELLER);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(user.id(), request));
    }

    @PutMapping("/{id}")
    public ProductResponse update(
            @PathVariable Long id,
            @RequestHeader(value = USER_ID, required = false) String userId,
            @RequestHeader(value = USER_TYPE, required = false) String userType,
            @RequestBody ProductRequest request) {
        var user = CurrentUser.from(userId, userType).requireRole(CurrentUser.SELLER);
        return service.update(id, user.id(), request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader(value = USER_ID, required = false) String userId,
            @RequestHeader(value = USER_TYPE, required = false) String userType) {
        var user = CurrentUser.from(userId, userType).requireRole(CurrentUser.SELLER);
        service.delete(id, user.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mine")
    public Page<ProductResponse> mine(
            @RequestHeader(value = USER_ID, required = false) String userId,
            @RequestHeader(value = USER_TYPE, required = false) String userType,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        var user = CurrentUser.from(userId, userType).requireRole(CurrentUser.SELLER);
        return service.findBySeller(user.id(), PageParams.of(page, size));
    }
}
