# Treehouse 1959 Hotel — Sistema de Gestión Full Stack

Sistema integral de reservas y gestión hotelera desarrollado para el **Hotel Treehouse 1959**, ubicado en Villavicencio, Meta, Colombia. Este es un proyecto real, robusto y escalable, diseñado para automatizar las operaciones diarias del hotel, desde la reserva pública hasta la facturación y el control de inventario.

---

## 🚀 Descripción

Aplicación web completa (Full Stack) que centraliza la operación hotelera en tres frentes:
- **Sitio Web Público:** Interfaz elegante para huéspedes con sistema de reserva en tiempo real y generación automática de confirmación en PDF.
- **Panel de Administración:** Control total sobre habitaciones, usuarios, inventario de productos y métricas del negocio.
- **Panel de Recepción:** Gestión ágil de check-ins, consumos de huéspedes, estados de cuenta y facturación final.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), Responsive Design |
| **Backend** | Node.js + Express.js |
| **Seguridad** | Bcrypt (Hashing de contraseñas) |
| **Documentación** | PDFKit (Generación dinámica de registros y facturas) |
| **Base de Datos** | MySQL |
| **Diseño** | Google Fonts, Estética Boutique |

---

## 📁 Estructura del Proyecto

```
TREEHOUSE-HOTEL/
├── contenido/              # Vistas HTML (Público, Admin y Recepción)
│   ├── admin/              # Gestión administrativa
│   ├── recepcion/          # Operación diaria y facturación
│   ├── index.html          # Landing page principal
│   └── ...                 # Flujo de reserva y disponibilidad
├── estilos/                # Hojas de estilo CSS unificadas
├── imagenes/               # Recursos visuales (Habitaciones e instalaciones)
├── js/                     # Lógica frontend (Consumo de API)
├── docs/                   # Documentos generados (PDFs)
├── server.js               # Servidor principal (Node.js + API REST)
├── db_hotel.sql            # Estructura principal de la base de datos
├── db_roles.sql            # Configuración de roles, usuarios y productos
└── package.json            # Dependencias y scripts
```

---

## ⚙️ Instalación y Configuración

### 1. Requisitos
- [Node.js](https://nodejs.org/) (v14+)
- [MySQL](https://www.mysql.com/) (XAMPP/WAMP recomendado para entorno local)

### 2. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/treehouse-hotel.git
cd treehouse-hotel
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Base de Datos
1. Crea una base de datos en MySQL llamada `db_treehouse`.
2. Importa el archivo `db_hotel.sql`.
3. Importa el archivo `db_roles.sql` para cargar la configuración inicial.

### 5. Variables de Entorno
Configura el archivo `.env` en la raíz con tus credenciales:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=db_treehouse
PORT=3000
```

### 6. Ejecutar el proyecto
```bash
npm start
```
El sistema estará disponible en `http://localhost:3000`.

---

## 🔐 Seguridad y Funcionalidades Clave

- **Protección de Datos:** Las contraseñas de los empleados están encriptadas mediante **Bcrypt**, garantizando la seguridad de las cuentas.
- **Generación de Documentos:** Uso de **PDFKit** para emitir registros de huéspedes y facturas profesionales de manera automatizada.
- **Gestión de Sesiones:** Sistema de login seguro con persistencia de roles (Admin/Recepción).
- **Control de Inventario:** Descuento automático de stock al registrar consumos de huéspedes.
- **Experiencia de Usuario:** Calendarios inteligentes, validación de disponibilidad y diseño adaptado a dispositivos móviles.

---

## 👤 Autor

**Desarrollador Full Stack** — [Tu Nombre/Perfil]
*Proyecto real implementado para Treehouse 1959 Hotel.*

---

## 📄 Licencia

Este proyecto es propiedad privada. Todos los derechos reservados.
