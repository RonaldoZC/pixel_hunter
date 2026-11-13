package br.edu.atitus.productapi.controllers;

import br.edu.atitus.productapi.dtos.ProductResponse;
import br.edu.atitus.productapi.services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

/** Rotas públicas de consulta. */
@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public Page<ProductResponse> list(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return service.search(categoryId, query, PageParams.of(page, size));
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return service.findById(id);
    }
}
