package br.edu.atitus.ordersapi.clients;

import br.edu.atitus.ordersapi.exceptions.ApiException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Cliente do product-api com resiliência (parâmetros externalizados no Consul, instância "product-api"):
 * Timeout (RestClient), Retry e Circuit Breaker. O Retry fica por fora e o Circuit Breaker por dentro,
 * então cada tentativa passa pelo circuito.
 *
 * <p>Erros de negócio (404 etc.) viram {@link ApiException}, que NÃO é repetida nem conta como falha do
 * circuito. Falhas de infraestrutura (timeout, conexão recusada, 5xx) sobem como
 * {@link RestClientException}: aí o Retry repete e o Circuit Breaker contabiliza.
 */
@Component
public class ProductCatalogClient implements ProductCatalog {

    private static final Logger log = LoggerFactory.getLogger(ProductCatalogClient.class);

    private static final String UNAVAILABLE_MESSAGE =
            "Serviço de produtos indisponível. Tente novamente em instantes.";

    private final RestClient restClient;

    public ProductCatalogClient(RestClient productRestClient) {
        this.restClient = productRestClient;
    }

    @Override
    @Retry(name = "product-api", fallbackMethod = "fallback")
    @CircuitBreaker(name = "product-api")
    public ProductSnapshot findById(Long id) {
        try {
            ProductSnapshot product = restClient.get().uri("/products/{id}", id).retrieve().body(ProductSnapshot.class);
            if (product == null || product.price() == null || product.title() == null) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Resposta inválida do serviço de produtos.");
            }
            return product;
        } catch (HttpClientErrorException.NotFound e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Produto " + id + " não encontrado.");
        } catch (HttpClientErrorException e) {
            // Outros 4xx: o problema não é de disponibilidade, então não adianta repetir.
            throw new ApiException(HttpStatus.BAD_GATEWAY, "O serviço de produtos recusou a consulta.");
        }
    }

    /** Esgotou as tentativas (timeout, conexão recusada, 5xx): responde 503 claro ao cliente. */
    public ProductSnapshot fallback(Long id, RestClientException e) {
        log.warn("product-api indisponível ao consultar o produto {}: {}", id, e.getMessage());
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, UNAVAILABLE_MESSAGE);
    }

    /** Circuito aberto: a chamada nem é feita, para não sobrecarregar um serviço que já está falhando. */
    public ProductSnapshot fallback(Long id, CallNotPermittedException e) {
        log.warn("Circuit Breaker do product-api aberto; consulta do produto {} recusada", id);
        throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, UNAVAILABLE_MESSAGE);
    }
}
