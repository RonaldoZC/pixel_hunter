-- Perfis BUYER/SELLER no lugar de type (0 = Admin, 1 = Common) e campos de perfil.
ALTER TABLE tb_user RENAME COLUMN name TO username;
ALTER TABLE tb_user ADD COLUMN link VARCHAR(500);
ALTER TABLE tb_user ADD COLUMN photo_url VARCHAR(500);
ALTER TABLE tb_user ADD COLUMN role VARCHAR(20);

-- Admin vira SELLER; Common vira BUYER.
UPDATE tb_user SET role = CASE type WHEN 0 THEN 'SELLER' ELSE 'BUYER' END;

ALTER TABLE tb_user ALTER COLUMN role SET NOT NULL;
ALTER TABLE tb_user ADD CONSTRAINT ck_tb_user_role CHECK (role IN ('BUYER', 'SELLER'));
ALTER TABLE tb_user DROP COLUMN type;

CREATE UNIQUE INDEX uq_tb_user_email ON tb_user (lower(email));
