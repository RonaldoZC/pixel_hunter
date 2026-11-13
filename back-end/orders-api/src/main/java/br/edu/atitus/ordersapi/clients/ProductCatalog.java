package br.edu.atitus.ordersapi.clients;

/** Fonte da verdade sobre produtos e preços (o product-api). */
public interface ProductCatalog {

    /** Lança ApiException 404 se o produto não existir e 503 se o serviço estiver fora do ar. */
    ProductSnapshot findById(Long id);
}
