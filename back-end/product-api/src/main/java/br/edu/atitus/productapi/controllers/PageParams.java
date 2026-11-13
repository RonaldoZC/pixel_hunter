package br.edu.atitus.productapi.controllers;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/** Paginação com limites seguros; ordena por título (e id, para a ordem ser estável). */
final class PageParams {

    static final int DEFAULT_SIZE = 20;
    static final int MAX_SIZE = 200;

    private PageParams() {
    }

    static Pageable of(Integer page, Integer size) {
        int p = page == null ? 0 : Math.max(page, 0);
        int s = size == null ? DEFAULT_SIZE : Math.min(Math.max(size, 1), MAX_SIZE);
        return PageRequest.of(p, s, Sort.by("title").and(Sort.by("id")));
    }
}
