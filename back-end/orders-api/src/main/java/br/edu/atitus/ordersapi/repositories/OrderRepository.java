package br.edu.atitus.ordersapi.repositories;

import br.edu.atitus.ordersapi.entities.OrderEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    Page<OrderEntity> findByBuyerId(Long buyerId, Pageable pageable);
}
