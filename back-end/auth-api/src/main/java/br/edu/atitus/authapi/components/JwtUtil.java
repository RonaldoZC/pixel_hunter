package br.edu.atitus.authapi.components;

import br.edu.atitus.authapi.entities.UserEntity;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/** Gera o JWT. O gateway valida com o mesmo segredo (variável JWT_SECRET, mínimo 32 caracteres). */
@Component
public class JwtUtil {

    private static final long EXPIRATION_MILLIS = 1000L * 60 * 60 * 24; // 24 horas

    private final SecretKey key;

    public JwtUtil(@Value("${app.jwt.secret}") String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET deve ter ao menos 32 caracteres.");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    /** Claims: id, email e type ("BUYER" ou "SELLER"). */
    public String generateToken(UserEntity user) {
        return Jwts.builder()
                .claim("id", user.getId())
                .claim("email", user.getEmail())
                .claim("type", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MILLIS))
                .signWith(key)
                .compact();
    }
}
