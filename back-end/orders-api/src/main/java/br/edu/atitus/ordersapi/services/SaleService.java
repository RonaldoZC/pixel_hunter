package br.edu.atitus.ordersapi.services;

import br.edu.atitus.ordersapi.dtos.SaleResponse;
import br.edu.atitus.ordersapi.repositories.OrderItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Histórico de vendas do vendedor, montado a partir dos itens de pedido. */
@Service
public class SaleService {

    private final OrderItemRepository repository;

    public SaleService(OrderItemRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<SaleResponse> list(Long sellerId, Pageable pageable) {
        return repository.findBySellerId(sellerId, pageable).map(SaleResponse::fromEntity);
    }
}
