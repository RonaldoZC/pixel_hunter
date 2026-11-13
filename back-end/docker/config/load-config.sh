#!/bin/sh

set -eu

# Credenciais do banco: vêm do ambiente do container (docker/.env). Sem elas, o script falha.
: "${DB_USER:?defina DB_USER no arquivo docker/.env}"
: "${DB_PASSWORD:?defina DB_PASSWORD no arquivo docker/.env}"

echo "=============================================="
echo " Carregando configurações no Consul"
echo "=============================================="

# Aguarda o Consul responder à API HTTP
until consul members >/dev/null 2>&1; do
  echo "Aguardando o Consul..."
  sleep 2
done

# Função auxiliar para cadastrar uma configuração
put() {
  consul kv put "$1" "$2"
}

# ============================================
# CONFIGURAÇÕES GERAIS - TODAS AS APLICAÇÕES
# ============================================
# Só o necessário (o gateway expõe o próprio /actuator na porta 8080, então nada de env/beans/heapdump)
put "config/application/management.endpoints.web.exposure.include" "health,info,metrics,prometheus"
put "config/application/management.endpoint.health.show-components" "always"
put "config/application/management.endpoint.health.show-details" "always"
put "config/application/management.health.livenessstate.enabled" "true"
put "config/application/management.health.readinessstate.enabled" "true"
put "config/application/management.health.db.enabled" "true"

# ============================================
# PRODUCT API
# ============================================
put "config/product-api/server.port" "8000"
put "config/product-api/spring.datasource.url" "jdbc:postgresql://product-db:5432/db_product"
put "config/product-api/spring.datasource.username" "${DB_USER}"
put "config/product-api/spring.datasource.password" "${DB_PASSWORD}"
put "config/product-api/app.promotion.message" "Promoção Semana do Cliente"

# Resilience4j - Retry
put "config/product-api/resilience4j.retry.instances.currency-api.max-attempts" "3"
put "config/product-api/resilience4j.retry.instances.currency-api.wait-duration" "1s"
put "config/product-api/resilience4j.retry.instances.currency-api.ignore-exceptions" "io.github.resilience4j.circuitbreaker.CallNotPermittedException"

# Resilience4j - Circuit Breaker
put "config/product-api/resilience4j.circuitbreaker.instances.currency-api.sliding-window-type" "COUNT_BASED"
put "config/product-api/resilience4j.circuitbreaker.instances.currency-api.sliding-window-size" "5"
put "config/product-api/resilience4j.circuitbreaker.instances.currency-api.minimum-number-of-calls" "5"
put "config/product-api/resilience4j.circuitbreaker.instances.currency-api.failure-rate-threshold" "50"
put "config/product-api/resilience4j.circuitbreaker.instances.currency-api.wait-duration-in-open-state" "100s"

# Cache
put "config/product-api/spring.cache.type" "caffeine"
put "config/product-api/spring.cache.cache-names" "currency-api"
put "config/product-api/spring.cache.caffeine.spec" "maximumSize=1000,expireAfterWrite=10m"

# Ordem dos aspectos
put "config/product-api/resilience4j.retry.retry-aspect-order" "100"
put "config/product-api/resilience4j.circuitbreaker.circuit-breaker-aspect-order" "101"


# ============================================
# CURRENCY API
# ============================================
put "config/currency-api/server.port" "8100"
put "config/currency-api/spring.datasource.url" "jdbc:postgresql://currency-db:5432/db_currency"
put "config/currency-api/spring.datasource.username" "${DB_USER}"
put "config/currency-api/spring.datasource.password" "${DB_PASSWORD}"

# Resilience4j - Retry (BCB)
put "config/currency-api/resilience4j.retry.instances.bcb.max-attempts" "3"
put "config/currency-api/resilience4j.retry.instances.bcb.wait-duration" "1s"
put "config/currency-api/resilience4j.retry.instances.bcb.ignore-exceptions" "io.github.resilience4j.circuitbreaker.CallNotPermittedException"

# Resilience4j - Circuit Breaker (BCB)
put "config/currency-api/resilience4j.circuitbreaker.instances.bcb.sliding-window-type" "COUNT_BASED"
put "config/currency-api/resilience4j.circuitbreaker.instances.bcb.sliding-window-size" "5"
put "config/currency-api/resilience4j.circuitbreaker.instances.bcb.minimum-number-of-calls" "5"
put "config/currency-api/resilience4j.circuitbreaker.instances.bcb.failure-rate-threshold" "50"
put "config/currency-api/resilience4j.circuitbreaker.instances.bcb.wait-duration-in-open-state" "100s"

# Cache
put "config/currency-api/spring.cache.type" "caffeine"
put "config/currency-api/spring.cache.cache-names" "bcb"
put "config/currency-api/spring.cache.caffeine.spec" "maximumSize=1000,expireAfterWrite=10m"

put "config/currency-api/resilience4j.retry.retry-aspect-order" "100"
put "config/currency-api/resilience4j.circuitbreaker.circuit-breaker-aspect-order" "101"

# ============================================
# AUTH API
# ============================================
put "config/auth-api/server.port" "8200"
put "config/auth-api/spring.datasource.url" "jdbc:postgresql://auth-db:5432/db_user"
put "config/auth-api/spring.datasource.username" "${DB_USER}"
put "config/auth-api/spring.datasource.password" "${DB_PASSWORD}"

# ============================================
# ORDERS API
# ============================================
put "config/orders-api/server.port" "8400"
put "config/orders-api/spring.datasource.url" "jdbc:postgresql://orders-db:5432/db_orders"
put "config/orders-api/spring.datasource.username" "${DB_USER}"
put "config/orders-api/spring.datasource.password" "${DB_PASSWORD}"

# Resilience4j - Retry (chamada orders-api -> product-api). Erros de negócio (ApiException) e circuito
# aberto não são repetidos.
put "config/orders-api/resilience4j.retry.instances.product-api.max-attempts" "3"
put "config/orders-api/resilience4j.retry.instances.product-api.wait-duration" "300ms"
put "config/orders-api/resilience4j.retry.instances.product-api.ignore-exceptions" "io.github.resilience4j.circuitbreaker.CallNotPermittedException,br.edu.atitus.ordersapi.exceptions.ApiException"

# Resilience4j - Circuit Breaker (chamada orders-api -> product-api)
put "config/orders-api/resilience4j.circuitbreaker.instances.product-api.sliding-window-type" "COUNT_BASED"
put "config/orders-api/resilience4j.circuitbreaker.instances.product-api.sliding-window-size" "10"
put "config/orders-api/resilience4j.circuitbreaker.instances.product-api.minimum-number-of-calls" "5"
put "config/orders-api/resilience4j.circuitbreaker.instances.product-api.failure-rate-threshold" "50"
put "config/orders-api/resilience4j.circuitbreaker.instances.product-api.wait-duration-in-open-state" "20s"
put "config/orders-api/resilience4j.circuitbreaker.instances.product-api.permitted-number-of-calls-in-half-open-state" "2"
put "config/orders-api/resilience4j.circuitbreaker.instances.product-api.automatic-transition-from-open-to-half-open-enabled" "true"
put "config/orders-api/resilience4j.circuitbreaker.instances.product-api.ignore-exceptions" "br.edu.atitus.ordersapi.exceptions.ApiException"

# Ordem dos aspectos: Retry por fora, Circuit Breaker por dentro
put "config/orders-api/resilience4j.retry.retry-aspect-order" "100"
put "config/orders-api/resilience4j.circuitbreaker.circuit-breaker-aspect-order" "101"

# ============================================
# MEDIA API
# ============================================
put "config/media-api/server.port" "8300"

# ============================================
# GATEWAY API
# ============================================
put "config/gateway-api/server.port" "8080"
# Propaga o contexto de tracing entre as etapas reativas do gateway
put "config/gateway-api/spring.reactor.context-propagation" "auto"

# ============================================
# OBSERVABILIDADE - TODAS AS APLICAÇÕES
# (Prometheus coleta /actuator/prometheus; traces vão para o Zipkin; logs são lidos pelo Promtail)
# ============================================
# Etiqueta "application" em todas as métricas (usada nos painéis do Grafana)
put "config/application/management.metrics.tags.application" '${spring.application.name}'
# Tracing distribuído: 100% das requisições (adequado para demonstração)
put "config/application/management.tracing.sampling.probability" "1.0"
put "config/application/management.tracing.export.zipkin.endpoint" "http://zipkin:9411/api/v2/spans"
# Logs com [aplicação,traceId,spanId], para ligar um log ao seu trace
put "config/application/logging.pattern.correlation" '[${spring.application.name:},%X{traceId:-},%X{spanId:-}] '
put "config/application/logging.include-application-name" "false"

echo "=============================================="
echo " Configurações carregadas com sucesso!"
echo "=============================================="