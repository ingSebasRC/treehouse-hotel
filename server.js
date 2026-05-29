// ============================================================
//  server.js — Servidor Node.js de Producción
//  Treehouse1959 Hotel
// ============================================================

require('dotenv').config();
const express = require('express');
const mysql   = require('mysql');
const cors    = require('cors');
const bcrypt  = require('bcrypt');
const path    = require('path');
const PDFDocument = require('pdfkit'); 
const fs = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ──────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos Estáticos: Servir contenido y carpetas de recursos
app.use(express.static(path.join(__dirname, 'contenido')));
app.use('/contenido', express.static(path.join(__dirname, 'contenido')));
app.use('/estilos', express.static(path.join(__dirname, 'estilos')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Ruta de Disponibilidad (Solicitada para evitar Cannot GET)
app.get('/contenido/disponibilidad.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'contenido', 'disponibilidad.html'));
});

// Ruta Raíz: Forzar carga del index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'contenido', 'index.html'));
});

// ── Conexión a MySQL ─────────────────────────
const conexion = mysql.createConnection({
  host:     process.env.DB_HOST || 'localhost',
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

conexion.connect(function (error) {
  if (error) {
    console.error('❌ Error crítico al conectar con MySQL:', {
      mensaje: error.message,
      codigo: error.code,
      host: process.env.DB_HOST,
      usuario: process.env.DB_USER,
      bd: process.env.DB_NAME
    });
    return;
  }
  console.log('✅ Conexión exitosa a la base de datos: ' + (process.env.DB_NAME || 'n/a'));
});

// ── RUTA: POST /api/reserva/pdf ──────────────
app.post('/api/reserva/pdf', function (req, res) {
  const data = req.body;
  const {
    nombre, apellidos, email, pais, ciudad, telefono,
    documento_tipo, documento_num, nacionalidad, profesion, empresa, placa_vehiculo,
    habitacion_id, fecha_checkin, fecha_checkout, num_adultos, num_ninos, acompanantes_nombres,
    comentario, info_comercial, estancia_previa
  } = data;

  const sqlHuesped = `INSERT INTO huespedes (nombre, apellidos, documento_tipo, documento_num, email, pais, nacionalidad, profesion, ciudad, telefono, empresa, placa_vehiculo, info_comercial, estancia_previa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const paramsHuesped = [nombre, apellidos, documento_tipo, documento_num, email, pais, nacionalidad, profesion || null, ciudad || null, telefono, empresa || null, placa_vehiculo || null, info_comercial ? 1 : 0, estancia_previa ? 1 : 0];

  conexion.query(sqlHuesped, paramsHuesped, (err, resH) => {
    if (err) return res.status(500).json({ ok: false, mensaje: err.message });
    const huesped_id = resH.insertId;
    const sqlReserva = `INSERT INTO reservas (huesped_id, habitacion_id, fecha_checkin, fecha_checkout, num_adultos, num_ninos, acompanantes_nombres, comentario, num_noches, metodo_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const paramsReserva = [huesped_id, habitacion_id, fecha_checkin, fecha_checkout, num_adultos, num_ninos, acompanantes_nombres || null, comentario || null, data.num_noches || 1, data.metodo_pago || 'hotel'];

    conexion.query(sqlReserva, paramsReserva, (err2, resR) => {
      if (err2) return res.status(500).json({ ok: false, mensaje: err2.message });
      const reservaId = resR.insertId;

      // Buscar info de habitación para el PDF
      conexion.query('SELECT nombre, valor_2p FROM habitaciones WHERE id = ?', [habitacion_id], (err3, resHab) => {
        const infoHab = resHab[0] || { nombre: 'N/A', valor_2p: 0 };
        const totalPagar = infoHab.valor_2p * (data.num_noches || 1);

        try {
          const doc = new PDFDocument({ margin: 50, size: 'A4' });
          res.setHeader('Content-disposition', `attachment; filename=Registro_${reservaId}.pdf`);
          res.setHeader('Content-type', 'application/pdf');
          res.setHeader('X-Reserva-Id', reservaId);
          res.setHeader('Access-Control-Expose-Headers', 'X-Reserva-Id');
          doc.pipe(res);

          doc.fontSize(26).font('Helvetica-Bold').fillColor('#1a3a2a').text('Treehouse 1959', { align: 'center' });
          doc.fontSize(10).font('Helvetica').fillColor('#4a5e50').text('HOTEL BOUTIQUE — VILLAVICENCIO, COLOMBIA', { align: 'center' });
          doc.moveDown(1.5);

          doc.rect(400, 95, 150, 30).fill('#f0e8d8');
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a3a2a').text(`RESERVA N°: ${reservaId}`, 405, 105, { width: 140, align: 'center' });
          doc.moveDown(2);

          doc.moveTo(50, 140).lineTo(550, 140).strokeColor('#c9a84c').lineWidth(1.5).stroke();
          doc.moveDown(1);

          doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a3a2a').text('DATOS DEL HUÉSPED', 50);
          doc.moveDown(0.5);
          doc.fontSize(10).font('Helvetica').fillColor('#000');

          const addRow = (lbl, val, x, y) => {
            doc.font('Helvetica-Bold').text(lbl, x, y);
            doc.font('Helvetica').text(val || '—', x + 85, y);
          };

          let curY = doc.y;
          addRow('Nombre:', `${nombre} ${apellidos}`, 50, curY); curY += 18;
          addRow('Documento:', `${documento_tipo} ${documento_num}`, 50, curY);
          addRow('Nacionalidad:', nacionalidad, 320, curY); curY += 18;
          addRow('Email:', email, 50, curY);
          addRow('Teléfono:', telefono, 320, curY); curY += 18;
          addRow('Profesión:', profesion, 50, curY);
          addRow('Empresa:', empresa, 320, curY); curY += 18;
          addRow('Ciudad:', ciudad, 50, curY);
          addRow('Placa Veh.:', placa_vehiculo, 320, curY); curY += 25;

          doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a3a2a').text('INFORMACIÓN DE ESTADÍA', 50, curY); curY += 20;
          doc.fontSize(10).fillColor('#000');
          addRow('Check-in:', fecha_checkin, 50, curY);
          addRow('Check-out:', fecha_checkout, 320, curY); curY += 18;
          addRow('Adultos:', num_adultos, 50, curY);
          addRow('Niños:', num_ninos, 320, curY); curY += 18;
          addRow('Habitación:', infoHab.nombre, 50, curY);
          addRow('Total Pagar:', `$${Number(totalPagar).toLocaleString()}`, 320, curY); curY += 25;

          doc.font('Helvetica-Bold').text('Acompañantes:', 50, curY);
          doc.font('Helvetica').text(acompanantes_nombres || 'Ninguno', 135, curY, { width: 400 });
          curY += Math.max(25, doc.heightOfString(acompanantes_nombres || '', { width: 400 }));

          doc.font('Helvetica-Bold').text('Comentarios:', 50, curY);
          doc.font('Helvetica').text(comentario || 'Sin observaciones', 135, curY, { width: 400 });

          doc.moveTo(50, 650).lineTo(220, 650).strokeColor('#000').lineWidth(0.5).stroke();
          doc.fontSize(9).text('Firma del Huésped', 50, 655, { width: 170, align: 'center' });

          doc.moveTo(350, 650).lineTo(520, 650).stroke();
          doc.text('Recepción / Sello', 350, 655, { width: 170, align: 'center' });

          doc.end();
        } catch (e) {
          console.error(e);
          res.status(500).send('Error PDF');
        }
      });
    });
  });
});

// ── OTRAS RUTAS API ──────────────────────────
app.post('/api/login', (req, res) => {
  console.log("Intento de login:", req.body.email);
  const { email, password } = req.body;
  
  // Buscar usuario por email
  conexion.query('SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ? AND activo = 1', [email], async (err, rows) => {
    if (err) {
      console.error("Error en login:", err.message);
      return res.status(500).json({ ok: false });
    }
    
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario no encontrado o inactivo' });
    }
    
    const usuario = rows[0];
    
    try {
      // Comparar contraseña recibida con el hash almacenado
      const match = await bcrypt.compare(password, usuario.password);
      
      if (match) {
        console.log("Login exitoso:", email);
        // No enviamos el hash al cliente
        delete usuario.password;
        res.json({ ok: true, usuario });
      } else {
        console.log("Contraseña incorrecta para:", email);
        res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
      }
    } catch (error) {
      console.error("Error al comparar contraseñas:", error);
      res.status(500).json({ ok: false });
    }
  });
});

app.get('/api/habitaciones', (req, res) => {
  conexion.query('SELECT * FROM habitaciones WHERE activa = 1 ORDER BY id ASC', (err, rows) => {
    if (err) {
      console.error("Error en /api/habitaciones:", err.message);
      return res.status(500).json({ ok: false });
    }
    console.log(`Cargadas ${rows.length} habitaciones`);
    res.json({ ok: true, data: rows });
  });
});

// ── RUTA: GET /api/habitaciones-disponibles ──
app.get('/api/habitaciones-disponibles', (req, res) => {
  console.log("Ruta de disponibilidad llamada");
  const { checkin, checkout } = req.query;

  if (!checkin || !checkout) {
    return res.status(400).json({ ok: false, mensaje: 'Faltan fechas de checkin o checkout' });
  }

  // Consulta para encontrar habitaciones que NO tienen reservas que se solapen
  const sql = `
    SELECT * FROM habitaciones 
    WHERE activa = 1 
    AND id NOT IN (
      SELECT habitacion_id FROM reservas 
      WHERE estado != 'cancelada'
      AND (
        (fecha_checkin < ?) AND (fecha_checkout > ?)
      )
    )
    ORDER BY id ASC
  `;

  conexion.query(sql, [checkout, checkin], (err, rows) => {
    if (err) {
      console.error('Error en /api/habitaciones-disponibles:', err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    res.json({ ok: true, data: rows });
  });
});

app.get('/api/admin/reservas', (req, res) => {
  const sql = `SELECT r.id, r.estado, r.fecha_checkin, r.fecha_checkout, r.num_noches, r.num_adultos, r.metodo_pago, r.created_at, h.nombre, h.apellidos, h.email, h.telefono, hab.nombre AS habitacion FROM reservas r JOIN huespedes h ON r.huesped_id = h.id JOIN habitaciones hab ON r.habitacion_id = hab.id ORDER BY r.created_at DESC`;
  conexion.query(sql, (err, rows) => {
    if (err) {
      console.error("Error en /api/admin/reservas:", err.message);
      return res.status(500).json({ ok: false });
    }
    console.log(`Cargadas ${rows.length} reservas admin`);
    res.json({ ok: true, data: rows });
  });
});

app.get('/api/admin/habitaciones-todas', (req, res) => {
  conexion.query('SELECT * FROM habitaciones ORDER BY id ASC', (err, rows) => {
    if (err) {
      console.error("Error en /api/admin/habitaciones-todas:", err.message);
      return res.status(500).json({ ok: false });
    }
    console.log(`Cargadas ${rows.length} habitaciones admin`);
    res.json({ ok: true, data: rows });
  });
});

app.post('/api/admin/habitaciones', (req, res) => {
  const { nombre, descripcion, tipo_cama, capacidad, precio_1p, iva_1p, valor_1p, precio_2p, iva_2p, valor_2p, activa } = req.body;
  console.log("Intentando añadir habitación:", nombre);
  const sql = 'INSERT INTO habitaciones (nombre, descripcion, tipo_cama, capacidad, precio_1p, iva_1p, valor_1p, precio_2p, iva_2p, valor_2p, activa) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
  conexion.query(sql, [nombre, descripcion, tipo_cama, capacidad, precio_1p, iva_1p, valor_1p, precio_2p, iva_2p, valor_2p, activa ? 1 : 0], (err, result) => {
    if (err) {
      console.error("Error añadiendo habitación:", err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    console.log("Habitación añadida exitosamente ID:", result.insertId);
    res.status(201).json({ ok: true, id: result.insertId });
  });
});

app.put('/api/admin/habitaciones/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, tipo_cama, capacidad, precio_1p, iva_1p, valor_1p, precio_2p, iva_2p, valor_2p, activa } = req.body;
  console.log("Actualizando habitación ID:", id);
  const sql = 'UPDATE habitaciones SET nombre=?, descripcion=?, tipo_cama=?, capacidad=?, precio_1p=?, iva_1p=?, valor_1p=?, precio_2p=?, iva_2p=?, valor_2p=?, activa=? WHERE id=?';
  conexion.query(sql, [nombre, descripcion, tipo_cama, capacidad, precio_1p, iva_1p, valor_1p, precio_2p, iva_2p, valor_2p, activa ? 1 : 0, id], (err) => {
    if (err) {
      console.error("Error actualizando habitación:", err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    console.log("Habitación actualizada exitosamente");
    res.json({ ok: true });
  });
});

app.get('/api/admin/productos', (req, res) => {
  conexion.query('SELECT * FROM productos ORDER BY categoria ASC, nombre ASC', (err, rows) => {
    if (err) {
      console.error("Error en /api/admin/productos:", err.message);
      return res.status(500).json({ ok: false });
    }
    console.log(`Cargadas ${rows.length} productos admin`);
    res.json({ ok: true, data: rows });
  });
});

app.post('/api/admin/productos', (req, res) => {
  const { nombre, descripcion, categoria, precio, stock } = req.body;
  console.log("Intentando añadir producto:", nombre);
  conexion.query('INSERT INTO productos (nombre, descripcion, categoria, precio, stock, activo) VALUES (?,?,?,?,?,1)', [nombre, descripcion, categoria, precio, stock], (err, result) => {
    if (err) {
      console.error("Error añadiendo producto:", err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    console.log("Producto añadido exitosamente ID:", result.insertId);
    res.status(201).json({ ok: true, id: result.insertId });
  });
});

app.put('/api/admin/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, categoria, precio, stock, activo } = req.body;
  console.log("Actualizando producto ID:", id);
  conexion.query('UPDATE productos SET nombre=?, descripcion=?, categoria=?, precio=?, stock=?, activo=? WHERE id=?', [nombre, descripcion, categoria, precio, stock, activo?1:0, id], (err) => {
    if (err) {
      console.error("Error actualizando producto:", err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    console.log("Producto actualizado exitosamente");
    res.json({ ok: true });
  });
});

app.get('/api/admin/usuarios', (req, res) => {
  conexion.query('SELECT id, nombre, email, rol, activo FROM usuarios ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ ok: false });
    res.json({ ok: true, data: rows });
  });
});

app.post('/api/admin/usuarios', async (req, res) => {
  const { nombre, email, password, rol, activo } = req.body;
  console.log("Intentando añadir usuario:", nombre);
  
  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = 'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?,?,?,?,?)';
    conexion.query(sql, [nombre, email, hashedPassword, rol, activo ? 1 : 0], (err, result) => {
      if (err) {
        console.error("Error añadiendo usuario:", err.message);
        return res.status(500).json({ ok: false, mensaje: err.message });
      }
      console.log("Usuario añadido exitosamente ID:", result.insertId);
      res.status(201).json({ ok: true, id: result.insertId });
    });
  } catch (error) {
    console.error("Error al encriptar contraseña:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al procesar la contraseña' });
  }
});

app.put('/api/admin/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol, activo, password } = req.body;
  console.log("Actualizando usuario ID:", id);
  
  try {
    let sql, params;
    if (password) {
      // Si hay una nueva contraseña, la encriptamos
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = 'UPDATE usuarios SET nombre=?, email=?, rol=?, activo=?, password=? WHERE id=?';
      params = [nombre, email, rol, activo ? 1 : 0, hashedPassword, id];
    } else {
      // Si no hay contraseña, no tocamos la columna password
      sql = 'UPDATE usuarios SET nombre=?, email=?, rol=?, activo=? WHERE id=?';
      params = [nombre, email, rol, activo ? 1 : 0, id];
    }

    conexion.query(sql, params, (err) => {
      if (err) {
        console.error("Error actualizando usuario:", err.message);
        return res.status(500).json({ ok: false, mensaje: err.message });
      }
      console.log("Usuario actualizado exitosamente");
      res.json({ ok: true });
    });
  } catch (error) {
    console.error("Error al procesar actualización de usuario:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al procesar los datos' });
  }
});

app.get('/api/admin/dashboard', (req, res) => {
  const q1 = 'SELECT COUNT(*) AS total FROM reservas';
  const q2 = 'SELECT COUNT(*) AS total FROM reservas WHERE DATE(fecha_checkin) = CURDATE()';
  const q3 = 'SELECT COUNT(*) AS total FROM productos WHERE activo = 1';
  const q4 = 'SELECT COUNT(*) AS total FROM huespedes';
  const q5 = `SELECT r.id, r.estado, r.fecha_checkin, h.nombre, h.apellidos, hab.nombre AS habitacion FROM reservas r JOIN huespedes h ON r.huesped_id = h.id JOIN habitaciones hab ON r.habitacion_id = hab.id ORDER BY r.created_at DESC LIMIT 8`;
  const q6 = 'SELECT nombre, categoria, precio, stock FROM productos WHERE activo = 1 ORDER BY stock ASC LIMIT 8';
  conexion.query(q1, (e1, r1) => {
    conexion.query(q2, (e2, r2) => {
      conexion.query(q3, (e3, r3) => {
        conexion.query(q4, (e4, r4) => {
          conexion.query(q5, (e5, r5) => {
            conexion.query(q6, (e6, r6) => {
              res.json({ ok: true, stats: { totalReservas: r1[0].total, checkinHoy: r2[0].total, totalProductos: r3[0].total, totalHuespedes: r4[0].total }, reservas: r5 || [], productos: r6 || [] });
            });
          });
        });
      });
    });
  });
});

// Rutas de actualización de estado
app.put('/api/admin/reservas/:id/estado', (req, res) => {
  conexion.query('UPDATE reservas SET estado = ? WHERE id = ?', [req.body.estado, req.params.id], (err) => {
    if (err) return res.status(500).json({ ok: false });
    res.json({ ok: true });
  });
});

// Rutas de Recepción
app.get('/api/recepcion/checkins-hoy', (req, res) => {
  conexion.query(`SELECT r.id, r.estado, r.fecha_checkin, r.fecha_checkout, r.num_noches, r.num_adultos, r.num_ninos, r.metodo_pago, h.nombre, h.apellidos, h.email, h.telefono, hab.nombre AS habitacion, hab.id AS habitacion_id FROM reservas r JOIN huespedes h ON r.huesped_id = h.id JOIN habitaciones hab ON r.habitacion_id = hab.id WHERE DATE(r.fecha_checkin) = CURDATE() ORDER BY r.created_at ASC`, (err, rows) => {
    if (err) {
      console.error("Error en /api/recepcion/checkins-hoy:", err.message);
      return res.status(500).json({ ok: false });
    }
    console.log(`Cargados ${rows.length} checkins hoy`);
    res.json({ ok: true, data: rows });
  });
});

app.get('/api/recepcion/huespedes-activos', (req, res) => {
  conexion.query(`SELECT r.id, r.estado, r.fecha_checkin, r.fecha_checkout, r.num_noches, r.num_adultos, r.num_ninos, r.metodo_pago, h.nombre, h.apellidos, h.email, h.telefono, hab.nombre AS habitacion, hab.id AS habitacion_id FROM reservas r JOIN huespedes h ON r.huesped_id = h.id JOIN habitaciones hab ON r.habitacion_id = hab.id WHERE DATE(r.fecha_checkin) <= CURDATE() AND DATE(r.fecha_checkout) >= CURDATE() AND r.estado != 'cancelada' ORDER BY r.fecha_checkout ASC`, (err, rows) => {
    if (err) {
      console.error("Error en /api/recepcion/huespedes-activos:", err.message);
      return res.status(500).json({ ok: false });
    }
    console.log(`Cargados ${rows.length} huespedes activos`);
    res.json({ ok: true, data: rows });
  });
});

app.get('/api/recepcion/huespedes', (req, res) => {
  conexion.query('SELECT * FROM huespedes ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error("Error en /api/recepcion/huespedes:", err.message);
      return res.status(500).json({ ok: false });
    }
    console.log(`Cargados ${rows.length} huespedes total`);
    res.json({ ok: true, data: rows });
  });
});

app.get('/api/recepcion/consumos/:reservaId', (req, res) => {
  const { reservaId } = req.params;
  const sql = `SELECT c.*, p.nombre AS producto_nombre, p.categoria FROM consumos c JOIN productos p ON c.producto_id = p.id WHERE c.reserva_id = ? ORDER BY c.created_at ASC`;
  conexion.query(sql, [reservaId], (err, rows) => {
    if (err) {
      console.error("Error en /api/recepcion/consumos:", err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    res.json({ ok: true, data: rows });
  });
});

app.get('/api/recepcion/reserva/:id', (req, res) => {
  console.log(`Consultando reserva ID: ${req.params.id}`);
  conexion.query(`SELECT r.*, h.nombre, h.apellidos, h.email, h.telefono, h.pais, h.ciudad, h.documento_num, h.documento_tipo, hab.nombre AS habitacion FROM reservas r JOIN huespedes h ON r.huesped_id = h.id JOIN habitaciones hab ON r.habitacion_id = hab.id WHERE r.id = ?`, [req.params.id], (err, rows) => {
    if (err || rows.length === 0) {
      console.error(`Reserva ${req.params.id} no encontrada o error:`, err ? err.message : 'No existe');
      return res.status(404).json({ ok: false });
    }
    const reserva = rows[0];
    conexion.query(`SELECT c.*, p.nombre AS producto_nombre, p.categoria FROM consumos c JOIN productos p ON c.producto_id = p.id WHERE c.reserva_id = ? ORDER BY c.created_at ASC`, [req.params.id], (err2, consumos) => {
      console.log(`Cargados ${consumos ? consumos.length : 0} consumos para reserva ${req.params.id}`);
      res.json({ ok: true, reserva, consumos: consumos || [] });
    });
  });
});

app.get('/api/recepcion/productos', (req, res) => {
  conexion.query('SELECT id, nombre, categoria, precio, stock FROM productos ORDER BY categoria, nombre', (err, rows) => {
    if (err) {
      console.error("Error en /api/recepcion/productos:", err.message);
      return res.status(500).json({ ok: false });
    }
    console.log(`Cargados ${rows.length} productos recepcion`);
    res.json({ ok: true, data: rows });
  });
});

// ── RUTA: GET /api/buscar-huesped/:documento ──
app.get('/api/buscar-huesped/:documento', (req, res) => {
  const { documento } = req.params;
  const sql = 'SELECT * FROM huespedes WHERE documento_num = ? ORDER BY id DESC LIMIT 1';
  
  conexion.query(sql, [documento], (err, rows) => {
    if (err) {
      console.error('Error al buscar huésped:', err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    
    if (rows.length > 0) {
      res.json({ ok: true, data: rows[0] });
    } else {
      res.json({ ok: false, mensaje: 'Huésped no encontrado' });
    }
  });
});

app.post('/api/recepcion/consumo', (req, res) => {
  const { reserva_id, producto_id, cantidad, usuario_id } = req.body;
  console.log(`Intentando añadir consumo: Reserva ${reserva_id}, Producto ${producto_id}, Cant ${cantidad}`);
  
  conexion.query('SELECT precio, stock FROM productos WHERE id = ?', [producto_id], (err, rows) => {
    if (err) {
      console.error("Error buscando producto:", err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    
    const producto = rows[0];
    const cant = parseInt(cantidad);
    if (producto.stock < cant) return res.status(400).json({ ok: false, mensaje: 'Stock insuficiente' });
    
    const subtotal = parseFloat(producto.precio) * cant;
    conexion.query('INSERT INTO consumos (reserva_id, producto_id, cantidad, precio_unit, subtotal, usuario_id) VALUES (?,?,?,?,?,?)', [reserva_id, producto_id, cant, producto.precio, subtotal, usuario_id], (err2, result) => {
      if (err2) {
        console.error("Error insertando consumo:", err2.message);
        return res.status(500).json({ ok: false, mensaje: err2.message });
      }
      
      conexion.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cant, producto_id], (err3) => {
        if (err3) console.error("Error actualizando stock:", err3.message);
        console.log("Consumo añadido exitosamente");
        res.status(201).json({ ok: true, id: result.insertId, subtotal });
      });
    });
  });
});

app.delete('/api/recepcion/consumo/:id', (req, res) => {
  conexion.query('SELECT producto_id, cantidad FROM consumos WHERE id = ?', [req.params.id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ ok: false });
    const { producto_id, cantidad } = rows[0];
    conexion.query('DELETE FROM consumos WHERE id = ?', [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ ok: false });
      conexion.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [cantidad, producto_id]);
      res.json({ ok: true });
    });
  });
});

app.post('/api/recepcion/factura', (req, res) => {
  const { reserva_id, total_reserva, usuario_id } = req.body;
  console.log(`Generando/Actualizando factura para reserva: ${reserva_id}`);
  
  conexion.query('SELECT COALESCE(SUM(subtotal), 0) AS total FROM consumos WHERE reserva_id = ?', [reserva_id], (err, rows) => {
    if (err) {
      console.error("Error calculando consumos para factura:", err.message);
      return res.status(500).json({ ok: false, mensaje: err.message });
    }
    
    const total_consumos = parseFloat(rows[0].total);
    const total_final = parseFloat(total_reserva) + total_consumos;
    
    const sql = `
      INSERT INTO facturas (reserva_id, total_reserva, total_consumos, total_final, generada_por) 
      VALUES (?,?,?,?,?) 
      ON DUPLICATE KEY UPDATE total_consumos=?, total_final=?, generada_por=?
    `;
    const params = [reserva_id, total_reserva, total_consumos, total_final, usuario_id, total_consumos, total_final, usuario_id];
    
    conexion.query(sql, params, (err2, result) => {
      if (err2) {
        console.error("Error guardando factura:", err2.message);
        return res.status(500).json({ ok: false, mensaje: err2.message });
      }
      
      conexion.query('UPDATE reservas SET estado = "confirmada" WHERE id = ?', [reserva_id], (err3) => {
        if (err3) console.error("Error actualizando estado reserva:", err3.message);
        console.log("Factura procesada correctamente");
        res.status(201).json({ ok: true, total_consumos, total_final, factura_id: result.insertId || reserva_id });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});