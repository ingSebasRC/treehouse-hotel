USE db_treehouse;

CREATE TABLE IF NOT EXISTS habitaciones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100)    NOT NULL,
  descripcion TEXT,
  tipo_cama   VARCHAR(50),
  capacidad   INT             DEFAULT 2,
  tag         VARCHAR(50),             
  imagen_url  VARCHAR(255),
  activa      TINYINT(1)      DEFAULT 1,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS huespedes (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  nombre              VARCHAR(100)    NOT NULL,
  apellidos           VARCHAR(150)    NOT NULL,
  email               VARCHAR(200)    NOT NULL,
  pais                VARCHAR(10)     NOT NULL,   
  ciudad              VARCHAR(100),
  telefono            VARCHAR(30)     NOT NULL,
  info_comercial      TINYINT(1)      DEFAULT 0,  
  estancia_previa     TINYINT(1)      DEFAULT 0,  
  created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservas (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  huesped_id          INT             NOT NULL,
  habitacion_id       INT             NOT NULL,
  fecha_checkin       DATE            NOT NULL,
  fecha_checkout      DATE            NOT NULL,
  num_adultos         INT             DEFAULT 2,
  num_ninos           INT             DEFAULT 0,
  num_noches          INT             NOT NULL,   
  metodo_pago         ENUM('hotel', 'prepago')    DEFAULT 'hotel',
  comentario          TEXT,
  estado              ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
  created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

  -- Relaciones
  FOREIGN KEY (huesped_id)    REFERENCES huespedes(id),
  FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
);

CREATE TABLE IF NOT EXISTS pagos (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id          INT             NOT NULL,
  titular             VARCHAR(150)    NOT NULL,

  ultimos_4           CHAR(4)         NOT NULL,
  mes_caducidad       CHAR(2)         NOT NULL,
  anio_caducidad      CHAR(4)         NOT NULL,
  estado_pago         ENUM('pendiente', 'procesado', 'fallido') DEFAULT 'pendiente',
  created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (reserva_id) REFERENCES reservas(id)
);

INSERT INTO habitaciones (nombre, descripcion, tipo_cama, capacidad, tag, imagen_url) VALUES
(
  'Estándar Doble',
  'Confort moderno con vistas al jardín. Ideal para parejas o viajeros de negocio que buscan calidad y tranquilidad.',
  'Cama doble', 2, 'Disponible',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80'
),
(
  'Superior con Balcón',
  'Despierta con el amanecer llanero desde tu balcón privado. Canales satelitales, radio reloj y todas las comodidades.',
  'Cama Queen', 2, 'Popular',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=700&q=80'
),
(
  'Suite Llanera',
  'Nuestra habitación más espaciosa. Área de estar, balcón amplio y toda la atmósfera del Treehouse para estadías especiales.',
  'Cama King', 3, 'Premium',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&q=80'
);

SHOW TABLES;
SELECT * FROM habitaciones;