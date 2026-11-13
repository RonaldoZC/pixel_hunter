package br.edu.atitus.productapi.services;

import br.edu.atitus.productapi.dtos.ProductRequest;
import br.edu.atitus.productapi.dtos.ProductResponse;
import br.edu.atitus.productapi.entities.CategoryEntity;
import br.edu.atitus.productapi.entities.ProductEntity;
import br.edu.atitus.productapi.exceptions.ApiException;
import br.edu.atitus.productapi.repositories.CategoryRepository;
import br.edu.atitus.productapi.repositories.ProductRepository;
import br.edu.atitus.productapi.util.SearchText;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class ProductService {

    static final BigDecimal MAX_PRICE = new BigDecimal("999999.99");

    private final ProductRepository repository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository repository, CategoryRepository categoryRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
    }

    public Page<ProductResponse> search(String categoryId, String query, Pageable pageable) {
        Specification<ProductEntity> spec = Specification.unrestricted();
        if (categoryId != null && !categoryId.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("categoryId"), categoryId.trim()));
        }
        String normalized = SearchText.normalize(query);
        if (!normalized.isEmpty()) {
            // Cada palavra precisa aparecer no texto indexado (título, descrição ou categoria).
            for (String word : normalized.split("\\s+")) {
                String pattern = "%" + escapeLike(word) + "%";
                spec = spec.and((root, q, cb) -> cb.like(root.get("searchText"), pattern, '\\'));
            }
        }
        return repository.findAll(spec, pageable).map(ProductResponse::fromEntity);
    }

    public ProductResponse findById(Long id) {
        return ProductResponse.fromEntity(getOrThrow(id));
    }

    public Page<ProductResponse> findBySeller(Long sellerId, Pageable pageable) {
        return repository.findBySellerId(sellerId, pageable).map(ProductResponse::fromEntity);
    }

    public ProductResponse create(Long sellerId, ProductRequest request) {
        var product = new ProductEntity();
        product.setSellerId(sellerId);
        apply(product, request);
        return ProductResponse.fromEntity(repository.save(product));
    }

    public ProductResponse update(Long id, Long userId, ProductRequest request) {
        var product = getOrThrow(id);
        requireOwner(product, userId);
        apply(product, request);
        return ProductResponse.fromEntity(repository.save(product));
    }

    public void delete(Long id, Long userId) {
        var product = getOrThrow(id);
        requireOwner(product, userId);
        repository.delete(product);
    }

    private ProductEntity getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
    }

    static void requireOwner(ProductEntity product, Long userId) {
        if (!product.getSellerId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Você não é o dono deste produto.");
        }
    }

    /** Valida o pedido e copia os campos para a entidade, mantendo o texto de busca em dia. */
    private void apply(ProductEntity product, ProductRequest request) {
        if (request == null) {
            throw badRequest("Requisição inválida.");
        }
        String title = trim(request.title());
        String description = trim(request.description());
        String imageUrl = trim(request.imageUrl());

        if (title.isEmpty()) throw badRequest("Informe o título.");
        if (title.length() > 150) throw badRequest("O título deve ter no máximo 150 caracteres.");
        if (description.isEmpty()) throw badRequest("Informe a descrição.");
        if (description.length() > 1000) throw badRequest("A descrição deve ter no máximo 1000 caracteres.");
        if (request.price() == null || request.price().signum() <= 0) {
            throw badRequest("O preço deve ser maior que zero.");
        }
        if (request.price().compareTo(MAX_PRICE) > 0) throw badRequest("Preço acima do limite permitido.");
        if (!imageUrl.matches("(?i)^https?://\\S+$") || imageUrl.length() > 500) {
            throw badRequest("Informe uma URL de imagem válida.");
        }
        String categoryId = trim(request.categoryId());
        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> badRequest("Categoria inexistente."));

        product.setTitle(title);
        product.setDescription(description);
        product.setPrice(request.price().setScale(2, RoundingMode.HALF_UP));
        product.setCategoryId(category.getId());
        product.setImageUrl(imageUrl);
        product.setSearchText(SearchText.build(title, description, category.getName()));
    }

    private static String trim(String value) {
        return value == null ? "" : value.trim();
    }

    private static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    private static String escapeLike(String text) {
        return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
