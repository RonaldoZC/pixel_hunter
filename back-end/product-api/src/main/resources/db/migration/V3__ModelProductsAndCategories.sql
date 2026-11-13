-- Adapta tb_product ao contrato novo da API (title, price em BRL, categoryId, imageUrl, sellerId)
-- e cria as categorias.

CREATE TABLE tb_category
(
    id   VARCHAR(50)  NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_tb_category PRIMARY KEY (id)
);

INSERT INTO tb_category (id, name)
VALUES ('criaturas', 'Criaturas'),
       ('decoracoes', 'Decorações'),
       ('estruturas', 'Estruturas'),
       ('efeitos', 'Efeitos'),
       ('consumiveis', 'Consumíveis'),
       ('equipamentos', 'Equipamentos'),
       ('personagens', 'Personagens'),
       ('transporte', 'Transporte');

ALTER TABLE tb_product RENAME COLUMN model TO title;
ALTER TABLE tb_product RENAME COLUMN image TO image_url;

ALTER TABLE tb_product ADD COLUMN category_id VARCHAR(50);
ALTER TABLE tb_product ADD COLUMN seller_id BIGINT;
ALTER TABLE tb_product ADD COLUMN search_text VARCHAR(1500);

-- A antiga "brand" era a loja/categoria. 'Ataques' passa a ser 'efeitos'.
UPDATE tb_product
SET category_id = CASE brand
                      WHEN 'Equipamentos' THEN 'equipamentos'
                      WHEN 'Consumíveis' THEN 'consumiveis'
                      WHEN 'Criaturas' THEN 'criaturas'
                      WHEN 'Personagens' THEN 'personagens'
                      WHEN 'Transporte' THEN 'transporte'
                      WHEN 'Ataques' THEN 'efeitos'
                      ELSE 'equipamentos'
    END;

-- O preço passa a ser sempre em BRL. Os produtos de demonstração tinham outras moedas:
-- convertemos UMA vez, com taxas fixas APROXIMADAS (só para os dados de exemplo).
ALTER TABLE tb_product
    ALTER COLUMN price TYPE NUMERIC(12, 2)
        USING ROUND((price * CASE currency
                                 WHEN 'USD' THEN 5.40
                                 WHEN 'EUR' THEN 6.30
                                 WHEN 'JPY' THEN 0.036
                                 WHEN 'CNY' THEN 0.75
                                 ELSE 1
            END)::numeric, 2);

-- Produtos de demonstração pertencem ao vendedor de demonstração (primeiro usuário do auth-api,
-- id 1 = admin@admin.dev, que virou SELLER). Os bancos são separados, então o id é fixo.
UPDATE tb_product SET seller_id = 1;

-- Texto de busca: título + descrição + nome da categoria, sem acentos e em minúsculas.
-- (O service Java mantém a mesma regra para novos produtos; aqui usamos translate() em vez de unaccent.)
UPDATE tb_product p
SET search_text = lower(translate(
        p.title || ' ' || p.description || ' ' || c.name,
        'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇáàâãäéèêëíìîïóòôõöúùûüç',
        'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc'))
FROM tb_category c
WHERE c.id = p.category_id;

ALTER TABLE tb_product DROP COLUMN brand;
ALTER TABLE tb_product DROP COLUMN currency;

ALTER TABLE tb_product ALTER COLUMN title SET NOT NULL;
ALTER TABLE tb_product ALTER COLUMN description TYPE VARCHAR(1000);
ALTER TABLE tb_product ALTER COLUMN description SET NOT NULL;
ALTER TABLE tb_product ALTER COLUMN image_url TYPE VARCHAR(500);
ALTER TABLE tb_product ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE tb_product ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE tb_product ALTER COLUMN seller_id SET NOT NULL;

ALTER TABLE tb_product
    ADD CONSTRAINT fk_tb_product_category FOREIGN KEY (category_id) REFERENCES tb_category (id);

CREATE INDEX idx_tb_product_category ON tb_product (category_id);
CREATE INDEX idx_tb_product_seller ON tb_product (seller_id);
