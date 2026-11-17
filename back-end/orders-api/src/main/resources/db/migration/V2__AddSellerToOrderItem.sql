-- Vendedor dono do produto no momento da venda: base do histórico de vendas (/ws/sales).
-- Nula nos itens antigos, anteriores a esta migração.
ALTER TABLE tb_order_item
    ADD COLUMN seller_id BIGINT;

CREATE INDEX idx_tb_order_item_seller ON tb_order_item (seller_id);
