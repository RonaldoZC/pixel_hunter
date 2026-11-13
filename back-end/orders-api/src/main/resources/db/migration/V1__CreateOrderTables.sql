CREATE TABLE tb_order
(
    id         BIGSERIAL      NOT NULL,
    buyer_id   BIGINT         NOT NULL,
    total      NUMERIC(12, 2) NOT NULL,
    status     VARCHAR(20)    NOT NULL,
    created_at TIMESTAMPTZ    NOT NULL,
    CONSTRAINT pk_tb_order PRIMARY KEY (id)
);

CREATE INDEX idx_tb_order_buyer ON tb_order (buyer_id, created_at DESC);

CREATE TABLE tb_order_item
(
    id       BIGSERIAL      NOT NULL,
    order_id BIGINT         NOT NULL,
    asset_id BIGINT         NOT NULL,
    title    VARCHAR(255)   NOT NULL,
    price    NUMERIC(12, 2) NOT NULL,
    CONSTRAINT pk_tb_order_item PRIMARY KEY (id),
    CONSTRAINT fk_tb_order_item_order FOREIGN KEY (order_id) REFERENCES tb_order (id) ON DELETE CASCADE,
    CONSTRAINT uq_tb_order_item UNIQUE (order_id, asset_id)
);
