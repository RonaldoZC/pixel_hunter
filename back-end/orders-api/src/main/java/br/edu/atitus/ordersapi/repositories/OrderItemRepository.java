package br.edu.atitus.ordersapi.repositories;

import br.edu.atitus.ordersapi.entities.OrderItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {

    /** Itens vendidos de um vendedor (a ordenação vem do Pageable). */
    Page<OrderItemEntity> findBySellerId(Long sellerId, Pageable pageable);
}
