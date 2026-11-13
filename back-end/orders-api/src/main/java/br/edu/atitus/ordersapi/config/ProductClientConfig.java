package br.edu.atitus.ordersapi.config;

import io.micrometer.observation.ObservationRegistry;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class ProductClientConfig {

    /**
     * Builder com balanceamento: "http://product-api" é resolvido pelo Consul.
     * Recebe o ObservationRegistry para que o tracing distribuído propague o traceId (cabeçalhos de
     * rastreamento) nas chamadas ao product-api; sem isso a requisição apareceria como dois traces separados.
     */
    @Bean
    @LoadBalanced
    RestClient.Builder loadBalancedRestClientBuilder(ObjectProvider<ObservationRegistry> observationRegistry) {
        return RestClient.builder()
                .observationRegistry(observationRegistry.getIfAvailable(() -> ObservationRegistry.NOOP));
    }

    @Bean
    RestClient productRestClient(
            RestClient.Builder builder,
            @Value("${orders.product-api.base-url:http://product-api}") String baseUrl) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        // Com 3 tentativas, 2 s de leitura mantém o pior caso (~7 s) abaixo do timeout de 10 s do app.
        requestFactory.setReadTimeout(Duration.ofSeconds(2));
        return builder.baseUrl(baseUrl).requestFactory(requestFactory).build();
    }
}
