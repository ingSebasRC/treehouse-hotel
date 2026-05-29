USE db_treehouse;

CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100)  NOT NULL,
  email       VARCHAR(200)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  rol         ENUM('admin', 'recepcionista') NOT NULL,
  activo      TINYINT(1)    DEFAULT 1,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150)  NOT NULL,
  descripcion VARCHAR(255),
  categoria   ENUM('alimentos', 'bebidas', 'servicios', 'minibar', 'otros') DEFAULT 'otros',
  precio      DECIMAL(10,2) NOT NULL,
  stock       INT           DEFAULT 0,
  activo      TINYINT(1)    DEFAULT 1,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consumos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id    INT           NOT NULL,
  producto_id   INT           NOT NULL,
  cantidad      INT           DEFAULT 1,
  precio_unit   DECIMAL(10,2) NOT NULL,
  subtotal      DECIMAL(10,2) NOT NULL,
  usuario_id    INT           NOT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reserva_id)  REFERENCES reservas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS facturas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id      INT           NOT NULL UNIQUE,
  total_reserva   DECIMAL(10,2) NOT NULL,
  total_consumos  DECIMAL(10,2) DEFAULT 0,
  total_final     DECIMAL(10,2) NOT NULL,
  generada_por    INT           NOT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reserva_id)   REFERENCES reservas(id),
  FOREIGN KEY (generada_por) REFERENCES usuarios(id)
);

INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'administrador@ejemplo.com', 'PASSWORD_CIFRADA_AQUI', 'admin'),
('Recepción', 'recepcionista@ejemplo.com', 'PASSWORD_CIFRADA_AQUI', 'recepcionista');

INSERT INTO productos (nombre, categoria, precio, stock) VALUES
('Agua mineral 500ml', 'bebidas', 3500, 50),
('Gaseosa', 'bebidas', 4000, 40),
('Cerveza', 'bebidas', 7000, 30),
('Jugo natural', 'bebidas', 6000, 20),
('Desayuno continental', 'alimentos', 18000, 20),
('Almuerzo', 'alimentos', 25000, 15),
('Snack de bienvenida', 'minibar', 12000, 25),
('Servicio de lavandería', 'servicios', 20000, 99),
('Tour llanero', 'servicios', 80000, 10);

