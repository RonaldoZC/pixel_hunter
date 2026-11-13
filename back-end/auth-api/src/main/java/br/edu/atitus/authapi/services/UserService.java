package br.edu.atitus.authapi.services;

import br.edu.atitus.authapi.components.Validator;
import br.edu.atitus.authapi.dtos.*;
import br.edu.atitus.authapi.entities.UserEntity;
import br.edu.atitus.authapi.entities.UserRole;
import br.edu.atitus.authapi.exceptions.ApiException;
import br.edu.atitus.authapi.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    static final int MIN_PASSWORD_LENGTH = 6;

    private final UserRepository repository;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repository, PasswordEncoder encoder) {
        this.repository = repository;
        this.encoder = encoder;
    }

    public UserEntity signup(SignupRequestDto dto) {
        if (dto == null) throw badRequest("Requisição inválida.");

        var user = new UserEntity();
        user.setUsername(validUsername(dto.username()));
        user.setEmail(validEmail(dto.email()));
        user.setRole(parseRole(dto.role()));
        if (dto.password() == null || dto.password().length() < MIN_PASSWORD_LENGTH) {
            throw badRequest("A senha deve ter ao menos " + MIN_PASSWORD_LENGTH + " caracteres.");
        }
        if (repository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Já existe usuário com este e-mail.");
        }
        user.setPassword(encoder.encode(dto.password()));
        return repository.save(user);
    }

    /** Devolve o usuário se as credenciais conferem; a mesma mensagem vale para e-mail ou senha errados. */
    public UserEntity authenticate(String email, String password) {
        var invalid = new ApiException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
        if (email == null || password == null) throw invalid;
        var user = repository.findByEmailIgnoreCase(email.trim()).orElseThrow(() -> invalid);
        if (!encoder.matches(password, user.getPassword())) throw invalid;
        return user;
    }

    public UserEntity getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    public UserEntity updateProfile(Long id, UpdateProfileRequestDto dto) {
        if (dto == null) throw badRequest("Requisição inválida.");
        var user = getById(id);
        String email = validEmail(dto.email());
        if (repository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Já existe usuário com este e-mail.");
        }
        user.setUsername(validUsername(dto.username()));
        user.setEmail(email);
        user.setLink(validOptionalUrl(dto.link(), "Link inválido. Use um endereço como https://meusite.com."));
        return repository.save(user);
    }

    public UserEntity updatePhoto(Long id, UpdatePhotoRequestDto dto) {
        if (dto == null) throw badRequest("Requisição inválida.");
        var user = getById(id);
        String url = validOptionalUrl(dto.photoUrl(), "URL da foto inválida.");
        if (url == null) throw badRequest("Informe a URL da foto.");
        user.setPhotoUrl(url);
        return repository.save(user);
    }

    static UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role == null ? "" : role.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw badRequest("Perfil inválido: use BUYER ou SELLER.");
        }
    }

    private static String validUsername(String username) {
        String value = username == null ? "" : username.trim();
        if (value.isEmpty()) throw badRequest("Informe o nome de usuário.");
        if (value.length() > 100) throw badRequest("O nome de usuário deve ter no máximo 100 caracteres.");
        return value;
    }

    private static String validEmail(String email) {
        String value = email == null ? "" : email.trim().toLowerCase();
        if (!Validator.validateEmail(value)) throw badRequest("E-mail inválido.");
        return value;
    }

    /** Campo opcional: vazio vira null; se preenchido, precisa ser http(s). */
    private static String validOptionalUrl(String url, String message) {
        if (url == null || url.isBlank()) return null;
        String value = url.trim();
        if (value.length() > 500 || !value.matches("(?i)^https?://\\S+$")) throw badRequest(message);
        return value;
    }

    private static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
