package br.edu.atitus.productapi.security;

import br.edu.atitus.productapi.exceptions.ApiException;
import org.springframework.http.HttpStatus;

/**
 * Usuário autenticado, montado a partir dos cabeçalhos que o gateway preenche depois de validar o JWT.
 * O gateway remove esses cabeçalhos se vierem do cliente, então só ele pode defini-los.
 */
public record CurrentUser(Long id, String type) {

    public static final String SELLER = "SELLER";

    public static CurrentUser from(String idHeader, String typeHeader) {
        if (idHeader == null || idHeader.isBlank() || typeHeader == null || typeHeader.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Autenticação necessária.");
        }
        try {
            return new CurrentUser(Long.valueOf(idHeader.trim()), typeHeader.trim());
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Autenticação inválida.");
        }
    }

    public CurrentUser requireRole(String role) {
        if (!role.equals(type)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Usuário sem permissão para esta operação.");
        }
        return this;
    }
}
