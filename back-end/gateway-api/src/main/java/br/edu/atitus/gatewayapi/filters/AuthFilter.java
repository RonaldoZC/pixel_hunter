package br.edu.atitus.gatewayapi.filters;

import br.edu.atitus.gatewayapi.components.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;

/**
 * Valida o JWT nas rotas /ws/** e repassa a identidade aos serviços em X-User-Id, X-User-Type
 * ("BUYER" ou "SELLER") e X-User-Email. Cabeçalhos X-User-* enviados pelo cliente são sempre removidos.
 * A checagem de perfil (BUYER/SELLER) e de dono é feita em cada serviço.
 */
@Component
public class AuthFilter implements GlobalFilter, Ordered {

    private static final List<String> PROTECTED_ROUTES = List.of("/ws/");
    private static final List<String> USER_HEADERS = List.of("X-User-Id", "X-User-Type", "X-User-Email");
    private static final Set<String> VALID_TYPES = Set.of("BUYER", "SELLER");

    private final JwtUtil jwtUtil;

    public AuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // 1. Remove cabeçalhos de identidade enviados pelo cliente (evita falsificação)
        ServerHttpRequest sanitized = request.mutate()
                .headers(headers -> USER_HEADERS.forEach(headers::remove))
                .build();

        String path = request.getURI().getPath();
        boolean isProtected = PROTECTED_ROUTES.stream().anyMatch(path::startsWith);

        // 2. Rotas públicas (e preflight CORS) passam sem identidade
        if (!isProtected || HttpMethod.OPTIONS.equals(request.getMethod())) {
            return chain.filter(exchange.mutate().request(sanitized).build());
        }

        // 3. Rotas protegidas: exige JWT válido
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Autenticação necessária.");
        }
        Claims claims = jwtUtil.validateToken(authHeader.substring(7));
        if (claims == null) {
            return unauthorized(exchange, "Sessão inválida ou expirada. Entre novamente.");
        }

        Long userId = claims.get("id", Long.class);
        String userType = claims.get("type", String.class);
        String email = claims.get("email", String.class);
        if (userId == null || email == null || userType == null || !VALID_TYPES.contains(userType)) {
            return unauthorized(exchange, "Sessão inválida ou expirada. Entre novamente.");
        }

        ServerHttpRequest authenticated = sanitized.mutate()
                .headers(headers -> {
                    headers.set("X-User-Id", userId.toString());
                    headers.set("X-User-Type", userType);
                    headers.set("X-User-Email", email);
                })
                .build();
        return chain.filter(exchange.mutate().request(authenticated).build());
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        var response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] body = ("{\"message\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body)));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
