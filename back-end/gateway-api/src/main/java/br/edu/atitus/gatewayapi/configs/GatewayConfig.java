package br.edu.atitus.gatewayapi.configs;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    RouteLocator getRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Rotas públicas
                .route("auth-api", route -> route
                        .path("/auth/**")
                        .uri("lb://auth-api"))
                .route("product-api", route -> route
                        .path("/products/**")
                        .uri("lb://product-api"))
                .route("categories", route -> route
                        .path("/categories/**")
                        .uri("lb://product-api"))
                .route("currency-api", route -> route
                        .path("/currencies/**")
                        .uri("lb://currency-api"))

                // Rotas protegidas (/ws/**): o AuthFilter exige JWT
                .route("product-api-ws", route -> route
                        .path("/ws/products/**")
                        .uri("lb://product-api"))
                .route("currency-api-ws", route -> route
                        .path("/ws/currencies/**")
                        .uri("lb://currency-api"))
                .route("auth-api-ws", route -> route
                        .path("/ws/auth/**", "/ws/users/**")
                        .uri("lb://auth-api"))
                .route("media-api-ws", route -> route
                        .path("/ws/media/**")
                        .uri("lb://media-api"))
                .route("orders-api-ws", route -> route
                        .path("/ws/orders/**", "/ws/sales/**")
                        .uri("lb://orders-api"))
                // Swagger: JSON de cada serviço exposto pelo gateway (público, só leitura)
                .route("docs-auth", route -> route
                        .path("/docs/auth/**")
                        .filters(f -> f.rewritePath("/docs/auth/(?<rest>.*)", "/${rest}"))
                        .uri("lb://auth-api"))
                .route("docs-product", route -> route
                        .path("/docs/product/**")
                        .filters(f -> f.rewritePath("/docs/product/(?<rest>.*)", "/${rest}"))
                        .uri("lb://product-api"))
                .route("docs-orders", route -> route
                        .path("/docs/orders/**")
                        .filters(f -> f.rewritePath("/docs/orders/(?<rest>.*)", "/${rest}"))
                        .uri("lb://orders-api"))
                .route("docs-currency", route -> route
                        .path("/docs/currency/**")
                        .filters(f -> f.rewritePath("/docs/currency/(?<rest>.*)", "/${rest}"))
                        .uri("lb://currency-api"))
                .route("docs-media", route -> route
                        .path("/docs/media/**")
                        .filters(f -> f.rewritePath("/docs/media/(?<rest>.*)", "/${rest}"))
                        .uri("lb://media-api"))
                .build();
    }
}
