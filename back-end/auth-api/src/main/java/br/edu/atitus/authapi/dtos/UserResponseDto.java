package br.edu.atitus.authapi.dtos;

import br.edu.atitus.authapi.entities.UserEntity;

/** Visão pública do usuário: nunca inclui a senha. */
public record UserResponseDto(Long id, String username, String email, String link, String photoUrl, String role) {

    public static UserResponseDto fromEntity(UserEntity u) {
        return new UserResponseDto(u.getId(), u.getUsername(), u.getEmail(), u.getLink(), u.getPhotoUrl(),
                u.getRole().name());
    }
}
