package br.edu.atitus.ordersapi.entities;

/**
 * Nesta versão não há pagamento: o pedido nasce CONFIRMED. Quando o pagamento existir, acrescentar
 * novos estados (ex.: PENDING_PAYMENT, PAID, CANCELED) aqui.
 */
public enum OrderStatus {
    CONFIRMED
}
