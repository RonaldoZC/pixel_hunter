package br.edu.atitus.currencyapi.controllers;

import br.edu.atitus.currencyapi.dtos.CurrencyResponse;
import br.edu.atitus.currencyapi.services.CurrencyService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/ws/currencies")
public class WsCurrencyController {

    private final CurrencyService service;

    public WsCurrencyController(@Qualifier("currencyServiceJpa") CurrencyService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<CurrencyResponse> getCurrency(
            @RequestParam String source,
            @RequestParam String target,
            @RequestHeader("X-User-Type") String userType) throws Exception {

        // Regra de autorização: o gateway envia o perfil do JWT (BUYER ou SELLER)
        if (!"BUYER".equals(userType) && !"SELLER".equals(userType)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário sem permissão");
        }

        var response = service.findBySourceCurrencyAndTargetCurrency(source, target);
        return ResponseEntity.ok(response);
    }

    // Tratamento de erro específico para esta rota
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> exceptionHandler(Exception ex) {
        return ResponseEntity.status(500).body("Ops!!! Algo deu errado. - " + ex.getMessage());
    }
}