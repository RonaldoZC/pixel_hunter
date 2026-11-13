@echo off
echo Iniciando Consul...
start "Consul" cmd /c "consul agent -dev"
echo Aguardando Consul iniciar...
timeout /t 10 /nobreak > nul
echo Carregando configuracoes...

REM ============================================
REM ATENCAO: as senhas "postgresql" abaixo sao so do banco LOCAL de desenvolvimento.
REM No Docker, usuario e senha vem de docker/.env (nunca versionado).
REM Configuracoes do product-api
REM ============================================
consul kv put config/product-api/server.port "8000"
consul kv put config/product-api/spring.datasource.url "jdbc:postgresql://localhost/db_product"
consul kv put config/product-api/spring.datasource.username "postgres"
consul kv put config/product-api/spring.datasource.password "postgresql"
consul kv put config/product-api/app.promotion.message "Customer Week Promotion"
consul kv put config/product-api,it/app.promotion.message "Promozione Settimana del Cliente"

REM ============================================
REM Configuracoes do currency-api
REM ============================================
consul kv put config/currency-api/server.port "8100"
consul kv put config/currency-api/spring.datasource.url "jdbc:postgresql://localhost/db_currency"
consul kv put config/currency-api/spring.datasource.username "postgres"
consul kv put config/currency-api/spring.datasource.password "postgresql"

REM ============================================
REM Configuracoes do auth-api
REM ============================================
consul kv put config/auth-api/server.port "8200"
consul kv put config/auth-api/spring.datasource.url "jdbc:postgresql://localhost/db_user"
consul kv put config/auth-api/spring.datasource.username "postgres"
consul kv put config/auth-api/spring.datasource.password "postgresql"

REM ============================================
REM Configuracoes do gateway-api  <-- ADICIONAR AQUI
REM ============================================
consul kv put config/orders-api/server.port "8400"
consul kv put config/orders-api/spring.datasource.url "jdbc:postgresql://localhost/db_orders"
consul kv put config/orders-api/spring.datasource.username "postgres"
consul kv put config/orders-api/spring.datasource.password "postgresql"
consul kv put config/media-api/server.port "8300"
consul kv put config/gateway-api/server.port "8080"

REM ============================================
REM Configuracoes gerais de monitoramento (todos os microservicos)
REM ============================================
consul kv put config/application/management.endpoints.web.exposure.include "health,info,metrics,prometheus"
consul kv put config/application/management.endpoint.health.show-components "always"
consul kv put config/application/management.endpoint.health.show-details "always"
consul kv put config/application/management.health.livenessstate.enabled "true"
consul kv put config/application/management.health.readinessstate.enabled "true"
consul kv put config/application/management.health.db.enabled "true"

REM ============================================
REM Configuracoes do Retry Pattern
REM ============================================
consul kv put config/product-api/resilience4j.retry.instances.currency-api.max-attempts "3"
consul kv put config/product-api/resilience4j.retry.instances.currency-api.wait-duration "1s"

REM ============================================
REM Configuracoes do Circuit Breaker Pattern
REM ============================================
consul kv put config/product-api/resilience4j.circuitbreaker.instances.currency-api.sliding-window-type "COUNT_BASED"
consul kv put config/product-api/resilience4j.circuitbreaker.instances.currency-api.sliding-window-size "5"
consul kv put config/product-api/resilience4j.circuitbreaker.instances.currency-api.minimum-number-of-calls "5"
consul kv put config/product-api/resilience4j.circuitbreaker.instances.currency-api.failure-rate-threshold "50"
consul kv put config/product-api/resilience4j.circuitbreaker.instances.currency-api.wait-duration-in-open-state "100s"

REM Nao repetir chamadas quando o Circuit Breaker estiver aberto
consul kv put config/product-api/resilience4j.retry.instances.currency-api.ignore-exceptions[0] "io.github.resilience4j.circuitbreaker.CallNotPermittedException"

REM ============================================
REM Configuracoes do Caching Pattern
REM ============================================
consul kv put config/product-api/spring.cache.type "caffeine"
consul kv put config/product-api/spring.cache.cache-names "currency-api"
consul kv put config/product-api/spring.cache.caffeine.spec "maximumSize=1000,expireAfterWrite=10m"

REM ============================================
REM Ordem dos interceptadores
REM ============================================
consul kv put config/product-api/resilience4j.retry.retry-aspect-order "100"
consul kv put config/product-api/resilience4j.circuitbreaker.circuit-breaker-aspect-order "101"

REM ============================================
REM Configuracoes do currency-api - Resilience (BCB)
REM ============================================
consul kv put config/currency-api/resilience4j.retry.instances.bcb.max-attempts "3"
consul kv put config/currency-api/resilience4j.retry.instances.bcb.wait-duration "1s"
consul kv put config/currency-api/resilience4j.retry.instances.bcb.ignore-exceptions[0] "io.github.resilience4j.circuitbreaker.CallNotPermittedException"

consul kv put config/currency-api/resilience4j.circuitbreaker.instances.bcb.sliding-window-type "COUNT_BASED"
consul kv put config/currency-api/resilience4j.circuitbreaker.instances.bcb.sliding-window-size "5"
consul kv put config/currency-api/resilience4j.circuitbreaker.instances.bcb.minimum-number-of-calls "5"
consul kv put config/currency-api/resilience4j.circuitbreaker.instances.bcb.failure-rate-threshold "50"
consul kv put config/currency-api/resilience4j.circuitbreaker.instances.bcb.wait-duration-in-open-state "100s"

consul kv put config/currency-api/spring.cache.type "caffeine"
consul kv put config/currency-api/spring.cache.cache-names "bcb"
consul kv put config/currency-api/spring.cache.caffeine.spec "maximumSize=1000,expireAfterWrite=10m"

consul kv put config/currency-api/resilience4j.retry.retry-aspect-order "100"
consul kv put config/currency-api/resilience4j.circuitbreaker.circuit-breaker-aspect-order "101"

REM ============================================
REM Resiliencia do orders-api -> product-api (Retry + Circuit Breaker)
REM ============================================
consul kv put config/orders-api/resilience4j.retry.instances.product-api.max-attempts "3"
consul kv put config/orders-api/resilience4j.retry.instances.product-api.wait-duration "300ms"
consul kv put config/orders-api/resilience4j.retry.instances.product-api.ignore-exceptions "io.github.resilience4j.circuitbreaker.CallNotPermittedException,br.edu.atitus.ordersapi.exceptions.ApiException"
consul kv put config/orders-api/resilience4j.circuitbreaker.instances.product-api.sliding-window-type "COUNT_BASED"
consul kv put config/orders-api/resilience4j.circuitbreaker.instances.product-api.sliding-window-size "10"
consul kv put config/orders-api/resilience4j.circuitbreaker.instances.product-api.minimum-number-of-calls "5"
consul kv put config/orders-api/resilience4j.circuitbreaker.instances.product-api.failure-rate-threshold "50"
consul kv put config/orders-api/resilience4j.circuitbreaker.instances.product-api.wait-duration-in-open-state "20s"
consul kv put config/orders-api/resilience4j.circuitbreaker.instances.product-api.permitted-number-of-calls-in-half-open-state "2"
consul kv put config/orders-api/resilience4j.circuitbreaker.instances.product-api.automatic-transition-from-open-to-half-open-enabled "true"
consul kv put config/orders-api/resilience4j.circuitbreaker.instances.product-api.ignore-exceptions "br.edu.atitus.ordersapi.exceptions.ApiException"
consul kv put config/orders-api/resilience4j.retry.retry-aspect-order "100"
consul kv put config/orders-api/resilience4j.circuitbreaker.circuit-breaker-aspect-order "101"

REM ============================================
REM Observabilidade (uso local: Zipkin em localhost; no Docker veja docker/config/load-config.sh)
REM ============================================
consul kv put config/gateway-api/spring.reactor.context-propagation "auto"
consul kv put config/application/management.metrics.tags.application "${spring.application.name}"
consul kv put config/application/management.tracing.sampling.probability "1.0"
consul kv put config/application/management.tracing.export.zipkin.endpoint "http://localhost:9411/api/v2/spans"
consul kv put config/application/logging.pattern.correlation "[${spring.application.name:},%%X{traceId:-},%%X{spanId:-}] "
consul kv put config/application/logging.include-application-name "false"

echo.
echo Consul iniciado e configuracoes carregadas!
pause