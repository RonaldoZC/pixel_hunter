package br.edu.atitus.gatewayapi.components;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/** Valida o JWT emitido pelo auth-api. O segredo (JWT_SECRET) é o mesmo nos dois serviços. */
@Component
public class JwtUtil {

    private final SecretKey key;

    public JwtUtil(@Value("${app.jwt.secret}") String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET deve ter ao menos 32 caracteres.");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    /** Devolve os claims, ou null se o token for inválido ou estiver expirado. */
    public Claims validateToken(String token) {
        try {
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        } catch (Exception e) {
            return null;
        }
    }
}
