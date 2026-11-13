package br.edu.atitus.authapi.services;

import br.edu.atitus.authapi.dtos.SignupRequestDto;
import br.edu.atitus.authapi.entities.UserEntity;
import br.edu.atitus.authapi.entities.UserRole;
import br.edu.atitus.authapi.exceptions.ApiException;
import br.edu.atitus.authapi.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository repository;
    private UserService service;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        repository = mock(UserRepository.class);
        service = new UserService(repository, encoder);
        when(repository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void signupHashesPasswordAndNormalizesEmail() {
        var user = service.signup(new SignupRequestDto(" Ana ", " ANA@Mail.com ", "segredo1", "seller"));
        assertEquals("ana@mail.com", user.getEmail());
        assertEquals("Ana", user.getUsername());
        assertEquals(UserRole.SELLER, user.getRole());
        assertNotEquals("segredo1", user.getPassword());
        assertTrue(encoder.matches("segredo1", user.getPassword()));
    }

    @Test
    void signupRejectsShortPasswordInvalidRoleAndDuplicateEmail() {
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class,
                () -> service.signup(new SignupRequestDto("Ana", "ana@mail.com", "123", "BUYER"))).getStatus());
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class,
                () -> service.signup(new SignupRequestDto("Ana", "ana@mail.com", "123456", "ADMIN"))).getStatus());
        when(repository.existsByEmailIgnoreCase("ana@mail.com")).thenReturn(true);
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class,
                () -> service.signup(new SignupRequestDto("Ana", "ana@mail.com", "123456", "BUYER"))).getStatus());
    }

    @Test
    void authenticateUsesSameErrorForUnknownEmailAndWrongPassword() {
        var stored = new UserEntity();
        stored.setPassword(encoder.encode("certa123"));
        when(repository.findByEmailIgnoreCase("a@a.com")).thenReturn(Optional.of(stored));
        when(repository.findByEmailIgnoreCase("x@a.com")).thenReturn(Optional.empty());

        assertSame(stored, service.authenticate("a@a.com", "certa123"));
        var wrong = assertThrows(ApiException.class, () -> service.authenticate("a@a.com", "errada"));
        var unknown = assertThrows(ApiException.class, () -> service.authenticate("x@a.com", "certa123"));
        assertEquals(HttpStatus.UNAUTHORIZED, wrong.getStatus());
        assertEquals("E-mail ou senha inválidos", wrong.getMessage());
        assertEquals(wrong.getMessage(), unknown.getMessage());
    }

    @Test
    void updateProfileRejectsEmailUsedByAnotherUser() {
        var me = new UserEntity();
        when(repository.findById(1L)).thenReturn(Optional.of(me));
        when(repository.existsByEmailIgnoreCaseAndIdNot("novo@a.com", 1L)).thenReturn(true);
        var ex = assertThrows(ApiException.class, () -> service.updateProfile(1L,
                new br.edu.atitus.authapi.dtos.UpdateProfileRequestDto("Ana", "novo@a.com", null)));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }
}
