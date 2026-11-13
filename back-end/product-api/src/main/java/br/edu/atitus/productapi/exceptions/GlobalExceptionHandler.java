package br.edu.atitus.productapi.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/** Converte qualquer erro em JSON { "message": "..." } com o status correto. */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ApiError(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        log.error("Erro inesperado", ex);
        return ResponseEntity.status(500).body(new ApiError("Erro interno. Tente novamente mais tarde."));
    }

    // Erros padrão do Spring MVC (JSON inválido, parâmetro com tipo errado, rota inexistente...).
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        String message = switch (statusCode.value()) {
            case 404 -> "Recurso não encontrado.";
            case 405 -> "Método não permitido.";
            case 400 -> "Requisição inválida.";
            default -> "Não foi possível processar a requisição.";
        };
        return ResponseEntity.status(statusCode).body(new ApiError(message));
    }
}
