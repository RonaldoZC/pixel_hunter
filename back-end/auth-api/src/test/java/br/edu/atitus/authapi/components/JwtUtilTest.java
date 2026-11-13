package br.edu.atitus.authapi.components;

import br.edu.atitus.authapi.entities.UserEntity;
import br.edu.atitus.authapi.entities.UserRole;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private static final String SECRET = "01234567890123456789012345678901";

    @Test
    void tokenCarriesRoleAsString() {
        var user = new UserEntity();
        user.setEmail("a@a.com");
        user.setRole(UserRole.BUYER);
        String token = new JwtUtil(SECRET).generateToken(user);

        var claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(token).getPayload();
        assertEquals("BUYER", claims.get("type", String.class));
        assertEquals("a@a.com", claims.get("email", String.class));
    }

    @Test
    void shortSecretIsRejected() {
        assertThrows(IllegalStateException.class, () -> new JwtUtil("curto"));
    }
}
