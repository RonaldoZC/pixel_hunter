package br.edu.atitus.authapi.dtos;

public record SignupRequestDto(String username, String email, String password, String role) {
}
