package br.edu.atitus.authapi.repositories;

import br.edu.atitus.authapi.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    Optional<UserEntity> findByEmailIgnoreCase(String email);
}
