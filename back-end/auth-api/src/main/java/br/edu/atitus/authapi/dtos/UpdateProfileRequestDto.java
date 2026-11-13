package br.edu.atitus.authapi.dtos;

public record UpdateProfileRequestDto(String username, String email, String link) {
}
