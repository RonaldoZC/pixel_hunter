package br.edu.atitus.authapi.exceptions;

/** Corpo padrão de erro: { "message": "..." }. */
public record ApiError(String message) {
}
