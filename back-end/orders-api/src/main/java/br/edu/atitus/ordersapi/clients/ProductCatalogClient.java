package br.edu.atitus.ordersapi.clients;

import br.edu.atitus.ordersapi.exceptions.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class ProductCatalogClient implements ProductCatalog {

    private final RestClient restClient;

    public ProductCatalogClient(RestClient productRestClient) {
        this.restClient = productRestClient;
    }

    @Override
    public ProductSnapshot findById(Long id) {
        try {
            ProductSnapshot product = restClient.get().uri("/products/{id}", id).retrieve().body(ProductSnapshot.class);
            if (product == null || product.price() == null || product.title() == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Resposta inválida do serviço de produtos.");
            }
            return product;
        } catch (HttpClientErrorException.NotFound e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Produto " + id + " não encontrado.");
        } catch (RestClientException e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Serviço de produtos indisponível. Tente novamente em instantes.");
        }
    }
}
