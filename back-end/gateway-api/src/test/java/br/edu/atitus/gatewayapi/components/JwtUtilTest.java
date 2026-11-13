package br.edu.atitus.gatewayapi.components;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private static final String SECRET = "01234567890123456789012345678901";

    private String token(String secret, long expiresInMillis) {
        return Jwts.builder()
                .claim("id", 3L)
                .claim("email", "a@a.com")
                .claim("type", "SELLER")
                .expiration(new Date(System.currentTimeMillis() + expiresInMillis))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    @Test
    void validTokenReturnsClaims() {
        var claims = new JwtUtil(SECRET).validateToken(token(SECRET, 60_000));
        assertNotNull(claims);
        assertEquals(3L, claims.get("id", Long.class));
        assertEquals("SELLER", claims.get("type", String.class));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        assertNull(new JwtUtil(SECRET).validateToken(token("ffffffffffffffffffffffffffffffff", 60_000)));
    }

    @Test
    void expiredTokenIsRejected() {
        assertNull(new JwtUtil(SECRET).validateToken(token(SECRET, -60_000)));
    }

    @Test
    void garbageIsRejected() {
        assertNull(new JwtUtil(SECRET).validateToken("nao-e-um-jwt"));
    }
}
