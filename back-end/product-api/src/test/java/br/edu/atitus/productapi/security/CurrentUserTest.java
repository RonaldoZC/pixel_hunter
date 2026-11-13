package br.edu.atitus.productapi.security;

import br.edu.atitus.productapi.exceptions.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;

class CurrentUserTest {

    @Test
    void missingHeadersMeansUnauthorized() {
        var ex = assertThrows(ApiException.class, () -> CurrentUser.from(null, "SELLER"));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    void nonNumericIdMeansUnauthorized() {
        var ex = assertThrows(ApiException.class, () -> CurrentUser.from("abc", "SELLER"));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    void wrongRoleIsForbidden() {
        var user = CurrentUser.from("7", "BUYER");
        var ex = assertThrows(ApiException.class, () -> user.requireRole(CurrentUser.SELLER));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void sellerPasses() {
        var user = CurrentUser.from("7", "SELLER").requireRole(CurrentUser.SELLER);
        assertEquals(7L, user.id());
    }
}
