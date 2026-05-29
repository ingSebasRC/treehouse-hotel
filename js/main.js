// ============================================
//  main.js — Treehouse1959 Hotel
// ============================================

// ── Navbar: cambia estilo al hacer scroll ────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Menú móvil: abrir y cerrar ───────────────
const hamburger  = document.getElementById('hamburger');
const closeMenu  = document.getElementById('closeMenu');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
  });
}

if (closeMenu && mobileMenu) {
  closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
}

// Cerrar al hacer clic en un enlace del menú móvil
document.querySelectorAll('.mm-link').forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu) mobileMenu.classList.remove('open');
  });
});

// ── Fechas por defecto ────────────────────────
const formatearFecha = fecha => fecha.toISOString().split('T')[0];

// ── CALENDARIO PERSONALIZADO ──────────────────
(function () {
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DIAS_SEM = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  // Estado
  let mesBase    = new Date(); mesBase.setDate(1);  // primer mes visible
  let checkin    = null;   // Date seleccionada
  let checkout   = null;   // Date seleccionada
  let paso       = 1;      // 1 = eligiendo checkin, 2 = eligiendo checkout
  let hoverDia   = null;   // día sobre el que está el cursor

  // Elementos del DOM
  const trigger      = document.getElementById('triggerFechas');
  const popup        = document.getElementById('calPopup');
  const grids        = document.getElementById('calGrids');
  const mesesEl      = document.getElementById('calMeses');
  const instruccion  = document.getElementById('calInstruccion');
  const labelCI      = document.getElementById('labelCheckin');
  const labelCO      = document.getElementById('labelCheckout');
  const badge        = document.getElementById('nochesBadge');
  const nochesNum    = document.getElementById('nochesNum');
  const nochesTexto  = document.getElementById('nochesTexto');
  const inputCI      = document.getElementById('checkin');
  const inputCO      = document.getElementById('checkout');

  // Abrir / cerrar popup
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const abierto = popup.classList.contains('visible');
    popup.classList.toggle('visible', !abierto);
    trigger.classList.toggle('activo', !abierto);
    if (!abierto) renderizar();
  });
  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && !trigger.contains(e.target)) {
      popup.classList.remove('visible');
      trigger.classList.remove('activo');
    }
  });

  // Navegación de meses
  document.getElementById('calPrev').addEventListener('click', (e) => {
    e.stopPropagation();
    mesBase.setMonth(mesBase.getMonth() - 1);
    renderizar();
  });
  document.getElementById('calNext').addEventListener('click', (e) => {
    e.stopPropagation();
    mesBase.setMonth(mesBase.getMonth() + 1);
    renderizar();
  });

  // Limpiar selección
  document.getElementById('calLimpiar').addEventListener('click', (e) => {
    e.stopPropagation();
    checkin = checkout = null; paso = 1;
    inputCI.value = inputCO.value = '';
    labelCI.textContent = 'Seleccionar';
    labelCO.textContent = 'Seleccionar';
    badge.style.display = 'none';
    instruccion.textContent = 'Selecciona la fecha de llegada';
    renderizar();
  });

  // ── Render principal ──────────────────────
  function renderizar() {
    // Títulos de los dos meses
    const mes2 = new Date(mesBase); mes2.setMonth(mes2.getMonth() + 1);
    mesesEl.innerHTML = `
      <span class="cal-mes-titulo">${MESES[mesBase.getMonth()]} ${mesBase.getFullYear()}</span>
      <span class="cal-mes-titulo">${MESES[mes2.getMonth()]} ${mes2.getFullYear()}</span>
    `;

    grids.innerHTML = '';
    grids.appendChild(renderMes(mesBase));
    grids.appendChild(renderMes(mes2));

    // Instrucción
    if (paso === 1) instruccion.textContent = 'Selecciona la fecha de llegada';
    else            instruccion.textContent = 'Ahora selecciona la fecha de salida';
  }

  // ── Render de un mes ──────────────────────
  function renderMes(fecha) {
    const anio  = fecha.getFullYear();
    const mes   = fecha.getMonth();
    const hoy   = new Date(); hoy.setHours(0,0,0,0);

    const primerDia    = new Date(anio, mes, 1);
    const ultimoDia    = new Date(anio, mes + 1, 0).getDate();
    // Lunes=0 ... Domingo=6
    let inicioOffset = primerDia.getDay() - 1;
    if (inicioOffset < 0) inicioOffset = 6;

    const grid = document.createElement('div');
    grid.className = 'cal-grid';

    // Días de la semana
    const semana = document.createElement('div');
    semana.className = 'cal-dias-semana';
    DIAS_SEM.forEach(d => {
      const s = document.createElement('div');
      s.className = 'cal-dia-sem';
      s.textContent = d;
      semana.appendChild(s);
    });
    grid.appendChild(semana);

    // Días
    const diasEl = document.createElement('div');
    diasEl.className = 'cal-dias';

    // Calcular rango activo (con hover para preview)
    const rangoInicio = checkin;
    let   rangoFin    = checkout || (paso === 2 && hoverDia ? hoverDia : null);

    // Celdas vacías al inicio
    for (let i = 0; i < inicioOffset; i++) {
      const v = document.createElement('div');
      v.className = 'cal-dia vacio';
      diasEl.appendChild(v);
    }

    let tooltipEl = null;
    let tooltipCelda = null;

    for (let d = 1; d <= ultimoDia; d++) {
      const fechaDia = new Date(anio, mes, d);
      fechaDia.setHours(0,0,0,0);

      const celda = document.createElement('div');
      celda.className = 'cal-dia';
      celda.textContent = d;

      // Pasado
      if (fechaDia < hoy) {
        celda.classList.add('pasado');
      } else {
        // Check-in seleccionado
        const esCI = rangoInicio && mismoDia(fechaDia, rangoInicio);
        const esCO = rangoFin    && mismoDia(fechaDia, rangoFin);

        if (esCI && esCO) {
          celda.classList.add('seleccionado');
        } else if (esCI) {
          celda.classList.add('rango-inicio');
        } else if (esCO && checkout) {
          celda.classList.add('rango-fin');
          // Tooltip sobre el día checkout con las noches reales
          const n = calcNoches(rangoInicio, rangoFin);
          if (n > 0) {
            tooltipCelda = celda;
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'cal-tooltip-noches';
            tooltipEl.textContent = n + (n === 1 ? ' noche' : ' noches');
          }
        } else if (rangoInicio && rangoFin && fechaDia > rangoInicio && fechaDia < rangoFin) {
          celda.classList.add('en-rango');
        }

        // Eventos de click
        celda.addEventListener('click', (e) => {
          e.stopPropagation();
          seleccionarDia(new Date(anio, mes, d));
        });

        // Hover preview del rango — solo actualiza clases, NO re-renderiza
        celda.addEventListener('mouseenter', () => {
          if (paso === 2 && checkin) {
            hoverDia = new Date(anio, mes, d);
            hoverDia.setHours(0,0,0,0);
            actualizarRangoHover();
          }
        });
      }

      diasEl.appendChild(celda);
    }

    grid.appendChild(diasEl);

    // Insertar tooltip si existe
    if (tooltipCelda && tooltipEl) {
      tooltipCelda.style.position = 'relative';
      tooltipCelda.style.overflow = 'visible';
      tooltipCelda.appendChild(tooltipEl);
    }

    return grid;
  }

  // ── Hover: actualiza clases sin destruir el DOM ──
  function actualizarRangoHover() {
    const todasCeldas = grids.querySelectorAll('.cal-dia:not(.vacio):not(.pasado)');
    // Quitar clases de rango previas del hover
    todasCeldas.forEach(c => {
      c.classList.remove('en-rango', 'rango-inicio', 'rango-fin', 'seleccionado');
      // Quitar tooltip de hover anterior
      const t = c.querySelector('.cal-tooltip-noches');
      if (t) t.remove();
    });

    if (!checkin || !hoverDia) return;

    const inicio = checkin;
    const fin    = hoverDia > checkin ? hoverDia : null;

    todasCeldas.forEach(celda => {
      const d = parseInt(celda.textContent);
      // Recuperar la fecha real de la celda desde su posición en el grid
      const gridParent = celda.closest('.cal-grid');
      const allGrids   = Array.from(grids.querySelectorAll('.cal-grid'));
      const gridIndex  = allGrids.indexOf(gridParent);
      const mesRef     = new Date(mesBase);
      mesRef.setMonth(mesRef.getMonth() + gridIndex);
      const fechaCelda = new Date(mesRef.getFullYear(), mesRef.getMonth(), d);
      fechaCelda.setHours(0,0,0,0);

      const esCI = mismoDia(fechaCelda, inicio);
      const esCO = fin && mismoDia(fechaCelda, fin);

      if (esCI && esCO) {
        celda.classList.add('seleccionado');
      } else if (esCI) {
        celda.classList.add('rango-inicio');
      } else if (esCO) {
        celda.classList.add('rango-fin');
        // Tooltip de noches sobre el checkout en hover
        const n = calcNoches(inicio, fin);
        if (n > 0) {
          const tip = document.createElement('div');
          tip.className = 'cal-tooltip-noches';
          tip.textContent = n + (n === 1 ? ' noche' : ' noches');
          celda.style.position = 'relative';
          celda.style.overflow = 'visible';
          celda.appendChild(tip);
        }
      } else if (fin && fechaCelda > inicio && fechaCelda < fin) {
        celda.classList.add('en-rango');
      }
    });
  }

  // ── Seleccionar un día ────────────────────
  function seleccionarDia(fecha) {
    if (paso === 1) {
      checkin  = fecha;
      checkout = null;
      paso     = 2;
      labelCI.textContent = formatearBonito(fecha);
      labelCO.textContent = 'Seleccionar';
      badge.style.display = 'none';
      inputCI.value = formatearFecha(fecha);
      inputCO.value = '';
    } else {
      if (fecha <= checkin) {
        // Si elige fecha <= checkin, reiniciar
        checkin = fecha; checkout = null; paso = 2;
        labelCI.textContent = formatearBonito(fecha);
        labelCO.textContent = 'Seleccionar';
        badge.style.display = 'none';
        inputCI.value = formatearFecha(fecha);
        inputCO.value = '';
      } else {
        checkout = fecha;
        paso = 1;
        hoverDia = null;
        labelCO.textContent = formatearBonito(fecha);
        inputCO.value = formatearFecha(fecha);
        // Mostrar badge de noches
        const n = calcNoches(checkin, checkout);
        nochesNum.textContent  = n;
        nochesTexto.textContent = n === 1 ? 'noche' : 'noches';
        badge.style.display = 'flex';
        // Cerrar popup
        setTimeout(() => {
          popup.classList.remove('visible');
          trigger.classList.remove('activo');
        }, 300);
      }
    }
    renderizar();
  }

  // ── Helpers ───────────────────────────────
  function mismoDia(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }
  function calcNoches(a, b) {
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  }
  function formatearBonito(fecha) {
    const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun',
                          'Jul','Ago','Sep','Oct','Nov','Dic'];
    return fecha.getDate() + ' ' + MESES_CORTOS[fecha.getMonth()] + ' ' + fecha.getFullYear();
  }

  // Render inicial
  renderizar();

})();

// ── Botón "Consultar disponibilidad" ─────────
document.getElementById('btnConsultar').addEventListener('click', () => {
  const ci      = document.getElementById('checkin').value;
  const co      = document.getElementById('checkout').value;
  const adultos = document.getElementById('adultos').value;
  const ninos   = document.getElementById('ninos').value;

  if (!ci || !co) {
    // Si no hay fechas, abrir el calendario
    const popup   = document.getElementById('calPopup');
    const trigger = document.getElementById('triggerFechas');
    popup.classList.add('visible');
    trigger.classList.add('activo');
    return;
  }

  // Navegar a disponibilidad con los parámetros en la URL
  const params = new URLSearchParams({ checkin: ci, checkout: co, adultos, ninos });
  window.location.href = '../contenido/disponibilidad.html?' + params.toString();
});

// ── Botones "Reservar" de las habitaciones ────
document.querySelectorAll('.room-book').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
    // Abrir el calendario automáticamente al llegar
    setTimeout(() => {
      const popup   = document.getElementById('calPopup');
      const trigger = document.getElementById('triggerFechas');
      if (!popup.classList.contains('visible')) {
        popup.classList.add('visible');
        trigger.classList.add('activo');
      }
    }, 600); // espera a que termine el scroll
  });
});

// ── Animación al hacer scroll (fade in) ──────
const observador = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.room-card, .amenity-card, .about-img, .gallery-item, .stat').forEach((el, i) => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(28px)';
  el.style.transition = `opacity 0.55s ease ${i * 0.06}s, transform 0.55s ease ${i * 0.06}s`;
  observador.observe(el);
});