# Treehouse1959 Hotel — Sistema Web
, Meta, Colombia. Desarro
Sistema de reservas y gestión hotelera para el **Hotel Treehouse1959**, ubicado en Villavicenciollado como proyecto académico de 7mo semestre de Ingeniería Informática.

---

## Descripción

Aplicación web completa que incluye:
- Sitio web público para consulta y reserva de habitaciones
- Panel de administración para gestión del hotel
- Panel de recepción para manejo de huéspedes y facturación

---

## Tecnologías utilizadas

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js + Express |
| Base de datos | MySQL (phpMyAdmin / XAMPP) |
| Fuentes | Google Fonts (Playfair Display, DM Sans) |

---

## Estructura del proyecto

```
TREEHOUSE-HOTEL/
├── contenido/
│   ├── index.html              # Página principal del hotel
│   ├── disponibilidad.html     # Resultados de búsqueda
│   ├── reserva.html            # Formulario de reserva
│   ├── confirmacion.html       # Confirmación de reserva
│   ├── login.html              # Acceso para personal
│   ├── admin/
│   │   ├── dashboard.html      # Panel principal admin
│   │   ├── reservas.html       # Gestión de reservas
│   │   ├── habitaciones.html   # Gestión de habitaciones
│   │   ├── productos.html      # Inventario de productos
│   │   └── usuarios.html       # Gestión de usuarios
│   └── recepcion/
│       ├── dashboard.html      # Panel de recepción
│       ├── huesped.html        # Cuenta del huésped / consumos
│       └── factura.html        # Generación de factura
├── estilos/
│   └── style.css               # Estilos globales
├── js/
│   ├── main.js                 # Lógica del frontend
│   └── conexion.js             # Servidor Node.js + rutas API
├── db_treehouse.sql            # Tablas principales
├── db_roles.sql                # Tablas de roles y productos
└── README.md
```

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v14 o superior
- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL)
- Navegador web moderno (Chrome, Edge, Firefox)

---

## Instalación y configuración

### 1. Clonar o descargar el proyecto

```bash
git clone https://github.com/tu-usuario/treehouse-hotel.git
```

O descarga el ZIP desde GitHub y extráelo.

### 2. Instalar dependencias de Node.js

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
npm install express mysql cors
```

### 3. Configurar la base de datos

1. Abre **XAMPP** y dale Start a **Apache** y **MySQL**
2. Abre el navegador y ve a `http://localhost/phpmyadmin`
3. Crea una base de datos llamada `db_treehouse`
4. Selecciona `db_treehouse` → pestaña **SQL**
5. Pega y ejecuta primero el contenido de `db_treehouse.sql`
6. Luego pega y ejecuta el contenido de `db_roles.sql`

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example` y configura tus credenciales de base de datos:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=db_treehouse
PORT=3000
```

### 5. Arrancar el servidor

```bash
node js/conexion.js
```

Deberías ver:

```
 Conexión exitosa a la base de datos db_treehouse
 Treehouse1959 — Servidor corriendo
     http://localhost:3000
```

### 6. Abrir el proyecto

Abre el navegador y ve a:

```
http://localhost:3000/contenido/index.html
```

---

## Roles del sistema

El sistema cuenta con dos roles para el personal del hotel:

### Administrador
- Acceso completo al panel de gestión
- Gestionar reservas (ver, confirmar, cancelar)
- Crear, editar y desactivar habitaciones
- Gestionar inventario de productos
- Administrar usuarios del sistema

### Recepcionista
- Ver reservas del día y huéspedes activos
- Acceder a la cuenta de cualquier huésped
- Cargar productos y servicios consumidos
- Generar e imprimir factura final

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@ejemplo.com | admin123 |
| Recepcionista | recepcion@ejemplo.com | recepcion123 |

> Cambiar estas contraseñas antes de poner el proyecto en producción.

---

## 🗄️ Base de datos

### Tablas principales (`db_treehouse.sql`)

| Tabla | Descripción |
|-------|-------------|
| `habitaciones` | Las habitaciones del hotel |
| `huespedes` | Datos personales de cada huésped |
| `reservas` | Reservas vinculadas a huéspedes y habitaciones |
| `pagos` | Datos de pago (prepago / en hotel) |

### Tablas de gestión (`db_roles.sql`)

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Personal del hotel con rol y contraseña |
| `productos` | Inventario de productos y servicios |
| `consumos` | Productos cargados a la cuenta de un huésped |
| `facturas` | Factura final generada al hacer checkout |

---

## Rutas de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/login` | Autenticación de usuarios |
| POST | `/api/reserva` | Crear nueva reserva |
| GET | `/api/admin/dashboard` | Stats del dashboard admin |
| GET | `/api/admin/reservas` | Listar todas las reservas |
| PUT | `/api/admin/reservas/:id/estado` | Cambiar estado de reserva |
| GET | `/api/admin/productos` | Listar productos |
| POST | `/api/admin/productos` | Crear producto |
| PUT | `/api/admin/productos/:id` | Editar producto |
| DELETE | `/api/admin/productos/:id` | Desactivar producto |
| GET | `/api/admin/habitaciones-todas` | Listar habitaciones |
| POST | `/api/admin/habitaciones` | Crear habitación |
| PUT | `/api/admin/habitaciones/:id` | Editar habitación |
| GET | `/api/admin/usuarios` | Listar usuarios |
| GET | `/api/recepcion/checkins-hoy` | Check-ins del día |
| GET | `/api/recepcion/huespedes-activos` | Huéspedes en el hotel |
| GET | `/api/recepcion/reserva/:id` | Detalle de una reserva |
| GET | `/api/recepcion/productos` | Productos disponibles |
| POST | `/api/recepcion/consumo` | Cargar consumo a huésped |
| DELETE | `/api/recepcion/consumo/:id` | Quitar consumo |
| POST | `/api/recepcion/factura` | Generar factura final |

---

## Funcionalidades destacadas

- **Calendario personalizado** con selección de rango de fechas y contador de noches
- **Sistema de roles** con sesión persistente (sessionStorage + localStorage)
- **Factura imprimible** — se oculta el sidebar al imprimir automáticamente
- **Control de stock** — se descuenta automáticamente al cargar consumos
- **Buscador en tiempo real** en todas las tablas del panel admin y recepción

---

## Notas importantes

- Este proyecto es de uso **académico / demostración**
- Las contraseñas se guardan en texto plano — en producción usar **bcrypt**
- Los datos de tarjeta solo guardan los **últimos 4 dígitos** por seguridad
- Para producción real se recomienda integrar una pasarela de pago (PayU, Stripe)

---

## 📄 Licencia

Proyecto académico — uso educativo.