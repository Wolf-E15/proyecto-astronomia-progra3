/* grafo-viewer.js — Grafo completo: inspección + fondo estrellado mejorado */

(function () {
  const canvas = document.getElementById('grafo-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const data = JSON.parse(document.getElementById('grafo-data').textContent);

  const COLORES_TIPO = {
    'Estrella': '#facc15',
    'Planeta': '#3b82f6',
    'Exoplaneta': '#22c55e',
    'Galaxia': '#a855f7',
    'Satélite': '#94a3b8',
    'Satelite': '#94a3b8',
    'Asteroide': '#a07d35',
    'Cometa': '#7eb6cd',
    'Planeta Enano': '#cbd5e1',
    'Constelación': '#7eb6cd',
    'Constelacion': '#7eb6cd',
    'default': '#94a3b8'
  };

  // ID offset usado por GrafoService.cs para nodos de Constelación
  const CONSTELACION_OFFSET = 1_000_000;
  const esConstelacion = (id) => id >= CONSTELACION_OFFSET;

  let nodos = {};
  let offset = { x: 0, y: 0 };
  let scale = 1;
  let targetScale = 1;
  let targetOffset = { x: 0, y: 0 };

  let dragging = false;
  let lastMouse = null;
  let hoveredId = null;
  let highlightedNames = [];

  let estrellas = [];
  let fugaces = [];
  let tick = 0;

  function ajustarTamanio() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.max(rect.width,  300);
    canvas.height = Math.max(rect.height, 300);
  }

  function crearEstrellas() {
    estrellas = [];

    for (let i = 0; i < 280; i++) {
      estrellas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        base: Math.random() * 1.15 + 0.2,
        brillo: Math.random() * 0.6 + 0.25,
        profundidad: Math.random() * 0.9 + 0.15,
        fase: Math.random() * Math.PI * 2
      });
    }
  }

  function inicializar() {
    const W = canvas.width;
    const H = canvas.height;
    const n = data.nodos.length;

    // Para N grande, distribuir en área más amplia que el canvas
    const factor = Math.max(1, Math.sqrt(n / 80));
    const areaW = W * factor;
    const areaH = H * factor;
    const offsetX = (W - areaW) / 2;
    const offsetY = (H - areaH) / 2;

    data.nodos.forEach(node => {
      nodos[node.id] = {
        ...node,
        x: offsetX + Math.random() * areaW,
        y: offsetY + Math.random() * areaH,
        vx: 0,
        vy: 0
      };
    });
  }

  function simularPaso() {
    const ids = Object.keys(nodos);
    const n = ids.length;

    // Repulsión más fuerte y rango más amplio para separar nodos
    const repulsion = 3500;
    const cutoff = 600;
    const centerForce = n > 200 ? 0.0003 : 0.00045;

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = nodos[ids[i]];
        const b = nodos[ids[j]];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy + 1;
        const dist = Math.sqrt(distSq);

        if (dist > cutoff) continue;

        const fuerza = repulsion / distSq;
        const fx = (dx / dist) * fuerza;
        const fy = (dy / dist) * fuerza;

        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    data.aristas.forEach(a => {
      const o = nodos[a.origen];
      const d = nodos[a.destino];
      if (!o || !d) return;

      const dx = d.x - o.x;
      const dy = d.y - o.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const fuerza = (dist - 220) * 0.018;
      const fx = (dx / dist) * fuerza;
      const fy = (dy / dist) * fuerza;

      o.vx += fx;
      o.vy += fy;
      d.vx -= fx;
      d.vy -= fy;
    });

    const W = canvas.width;
    const H = canvas.height;
    const maxVel = 8;

    ids.forEach(id => {
      const nodo = nodos[id];

      nodo.vx += (W / 2 - nodo.x) * centerForce;
      nodo.vy += (H / 2 - nodo.y) * centerForce;

      nodo.vx *= 0.84;
      nodo.vy *= 0.84;

      // Cap velocity to prevent explosion
      const vmag = Math.sqrt(nodo.vx * nodo.vx + nodo.vy * nodo.vy);
      if (vmag > maxVel) {
        nodo.vx = (nodo.vx / vmag) * maxVel;
        nodo.vy = (nodo.vy / vmag) * maxVel;
      }

      nodo.x += nodo.vx;
      nodo.y += nodo.vy;
    });
  }

  function dibujarFondo() {
    const W = canvas.width;
    const H = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#060b18');
    grad.addColorStop(0.35, '#0b1022');
    grad.addColorStop(0.7, '#07142a');
    grad.addColorStop(1, '#020617');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const nebulaMorada = ctx.createRadialGradient(
      W * 0.25, H * 0.45, 20,
      W * 0.25, H * 0.45, W * 0.45
    );
    nebulaMorada.addColorStop(0, 'rgba(88, 28, 135, 0.35)');
    nebulaMorada.addColorStop(0.35, 'rgba(88, 28, 135, 0.16)');
    nebulaMorada.addColorStop(1, 'rgba(88, 28, 135, 0)');

    ctx.fillStyle = nebulaMorada;
    ctx.fillRect(0, 0, W, H);

    const nebulaAzul = ctx.createRadialGradient(
      W * 0.72, H * 0.55, 20,
      W * 0.72, H * 0.55, W * 0.55
    );
    nebulaAzul.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    nebulaAzul.addColorStop(0.45, 'rgba(14, 165, 233, 0.10)');
    nebulaAzul.addColorStop(1, 'rgba(37, 99, 235, 0)');

    ctx.fillStyle = nebulaAzul;
    ctx.fillRect(0, 0, W, H);

    const oscurecer = ctx.createRadialGradient(
      W / 2, H / 2, W * 0.2,
      W / 2, H / 2, W * 0.8
    );
    oscurecer.addColorStop(0, 'rgba(0,0,0,0)');
    oscurecer.addColorStop(1, 'rgba(0,0,0,0.45)');

    ctx.fillStyle = oscurecer;
    ctx.fillRect(0, 0, W, H);
  }

  function dibujarEstrellas(t) {
    estrellas.forEach(s => {
      const px = offset.x * s.profundidad * 0.018;
      const py = offset.y * s.profundidad * 0.018;

      const x = ((s.x + px) % canvas.width + canvas.width) % canvas.width;
      const y = ((s.y + py) % canvas.height + canvas.height) % canvas.height;

      const radio = s.base * Math.max(0.45, Math.min(2.7, scale));
      const pulso = 0.72 + Math.sin(t * 0.0014 + s.fase) * 0.28;

      ctx.beginPath();
      ctx.arc(x, y, radio * pulso, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.brillo * pulso})`;
      ctx.fill();
    });
  }

  function crearFugaz(x, y) {
    if (fugaces.length >= 4) return;

    fugaces.push({
      x,
      y,
      vx: -7 - Math.random() * 3,
      vy: 2 + Math.random() * 1.5,
      vida: 1,
      largo: 60 + Math.random() * 50
    });
  }

  function dibujarFugaces() {
    fugaces.forEach(f => {
      const colaX = f.x - f.vx * f.largo * 0.08;
      const colaY = f.y - f.vy * f.largo * 0.08;

      const grad = ctx.createLinearGradient(f.x, f.y, colaX, colaY);
      grad.addColorStop(0, `rgba(255,255,255,${f.vida})`);
      grad.addColorStop(0.45, `rgba(96,165,250,${f.vida * 0.65})`);
      grad.addColorStop(1, 'rgba(96,165,250,0)');

      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(colaX, colaY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      f.x += f.vx;
      f.y += f.vy;
      f.vida -= 0.035;
    });

    fugaces = fugaces.filter(f => f.vida > 0);
  }

  function aristaResaltada(a) {
    if (!highlightedNames || highlightedNames.length < 2) return false;

    const o = nodos[a.origen];
    const d = nodos[a.destino];
    if (!o || !d) return false;

    for (let i = 0; i < highlightedNames.length - 1; i++) {
      const actual = highlightedNames[i];
      const siguiente = highlightedNames[i + 1];

      if (
        (o.nombre === actual && d.nombre === siguiente) ||
        (o.nombre === siguiente && d.nombre === actual)
      ) {
        return true;
      }
    }

    return false;
  }

  function dibujarGrafo() {
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    data.aristas.forEach(a => {
      const o = nodos[a.origen];
      const d = nodos[a.destino];
      if (!o || !d) return;

      const activa = aristaResaltada(a);

      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(d.x, d.y);

      ctx.strokeStyle = activa
        ? 'rgba(250,204,21,0.95)'
        : scale < 0.25
          ? 'rgba(148,163,184,0.10)'
          : 'rgba(148,163,184,0.30)';

      ctx.lineWidth = activa ? 2.6 / scale : 1 / scale;

      if (activa) {
        ctx.shadowColor = 'rgba(250,204,21,.8)';
        ctx.shadowBlur = 12;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    Object.values(nodos).forEach(n => {
      const color = COLORES_TIPO[n.tipo] || COLORES_TIPO.default;
      const hover = hoveredId === n.id;
      const resaltado = highlightedNames.includes(n.nombre);
      const isConst = esConstelacion(n.id);

      // Constelaciones: nodos hub más grandes, con anillo dorado
      let radio;
      if (isConst) {
        radio = hover ? 16 : resaltado ? 14 : 12;
      } else {
        radio = hover ? 10 : resaltado ? 9 : 6;
      }

      const glow = ctx.createRadialGradient(n.x, n.y, 1, n.x, n.y, radio * 2.5);
      glow.addColorStop(0, color);
      glow.addColorStop(0.35, color + '99');
      glow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.arc(n.x, n.y, radio * 2.3 / scale, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, radio / scale, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Anillo dorado decorativo solo en constelaciones
      if (isConst) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, (radio + 4) / scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212,166,87,0.85)';
        ctx.lineWidth = 1.4 / scale;
        ctx.stroke();

        // Cruz interior tipo retícula
        ctx.beginPath();
        ctx.moveTo(n.x - radio * 0.5 / scale, n.y);
        ctx.lineTo(n.x + radio * 0.5 / scale, n.y);
        ctx.moveTo(n.x, n.y - radio * 0.5 / scale);
        ctx.lineTo(n.x, n.y + radio * 0.5 / scale);
        ctx.strokeStyle = 'rgba(6,8,18,0.9)';
        ctx.lineWidth = 1.2 / scale;
        ctx.stroke();
      }

      ctx.strokeStyle = hover || resaltado ? '#fff' : 'rgba(255,255,255,.75)';
      ctx.lineWidth = (hover || resaltado ? 2 : 1) / scale;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radio / scale, 0, Math.PI * 2);
      ctx.stroke();

      if (resaltado) {
        const pulse = 1 + 0.35 * Math.sin(Date.now() / 300);
        ctx.beginPath();
        ctx.arc(n.x, n.y, (radio + 6) * pulse / scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(250,204,21,0.8)';
        ctx.lineWidth = 2 / scale;
        ctx.shadowColor = 'rgba(250,204,21,0.9)';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Constelaciones siempre muestran su nombre
      if (scale > 0.32 || hover || resaltado || isConst) {
        ctx.fillStyle = hover || resaltado ? '#fff' : (isConst ? '#f3c87c' : '#e5e7eb');
        const fontSize = isConst ? (hover ? 14 : 12) : (hover ? 13 : 11);
        const weight = isConst ? '600' : '400';
        ctx.font = `${weight} ${fontSize / scale}px 'JetBrains Mono', monospace`;
        ctx.shadowColor = 'rgba(0,0,0,.95)';
        ctx.shadowBlur = 5;
        const labelX = n.x + (radio + 6) / scale;
        ctx.fillText(n.nombre, labelX, n.y + 4 / scale);
        ctx.shadowBlur = 0;
      }
    });

    ctx.restore();
  }

  function envolverTexto(ctx, texto, maxAncho) {
    const palabras = texto.split(' ');
    const lineas = [];
    let actual = '';
    palabras.forEach(p => {
      const test = actual ? actual + ' ' + p : p;
      if (ctx.measureText(test).width > maxAncho && actual) {
        lineas.push(actual);
        actual = p;
      } else {
        actual = test;
      }
    });
    if (actual) lineas.push(actual);
    return lineas;
  }

  function dibujarTooltip() {
    if (!hoveredId) return;

    const n = nodos[hoveredId];
    if (!n) return;

    const isConst = esConstelacion(n.id);
    const x = n.x * scale + offset.x;
    const y = n.y * scale + offset.y;

    if (isConst) {
      // Tooltip extendido con descripción
      const maxAncho = 280;
      ctx.font = "13px 'JetBrains Mono', Segoe UI, Arial";

      const titulo = n.nombre.toUpperCase();
      const subtitulo = n.abreviatura ? `Constelación · ${n.abreviatura}` : 'Constelación';
      const desc = n.descripcion || 'Sin descripción registrada.';

      ctx.font = "11px 'JetBrains Mono', Segoe UI, Arial";
      const lineasDesc = envolverTexto(ctx, desc, maxAncho - 24).slice(0, 4);

      const altoTitulo = 24;
      const altoSub = 18;
      const altoDesc = lineasDesc.length * 16 + 10;
      const altoTotal = altoTitulo + altoSub + altoDesc + 18;

      // Box
      ctx.fillStyle = 'rgba(6,8,18,.94)';
      ctx.strokeStyle = 'rgba(212,166,87,.7)';
      ctx.lineWidth = 1;
      roundRect(ctx, x + 18, y - altoTotal - 8, maxAncho, altoTotal, 4);
      ctx.fill();
      ctx.stroke();

      // Barra dorada izquierda
      ctx.fillStyle = '#d4a657';
      ctx.fillRect(x + 18, y - altoTotal - 8, 3, altoTotal);

      // Título
      ctx.fillStyle = '#f3c87c';
      ctx.font = "600 13px 'JetBrains Mono', Segoe UI, Arial";
      ctx.fillText(titulo, x + 32, y - altoTotal + 10);

      // Subtítulo
      ctx.fillStyle = '#a39b85';
      ctx.font = "10px 'JetBrains Mono', Segoe UI, Arial";
      ctx.fillText(subtitulo, x + 32, y - altoTotal + 28);

      // Descripción
      ctx.fillStyle = '#d4cbb0';
      ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
      lineasDesc.forEach((linea, i) => {
        ctx.fillText(linea, x + 32, y - altoTotal + 50 + i * 16);
      });

      return;
    }

    // Tooltip normal (objeto)
    ctx.font = "13px 'JetBrains Mono', Segoe UI, Arial";
    const texto1 = n.nombre;
    const texto2 = n.tipo || 'Objeto astronómico';
    const ancho = Math.max(ctx.measureText(texto1).width, ctx.measureText(texto2).width) + 28;

    ctx.fillStyle = 'rgba(6,8,18,.92)';
    ctx.strokeStyle = 'rgba(212,166,87,.5)';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 16, y - 50, ancho, 50, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d4a657';
    ctx.fillRect(x + 16, y - 50, 3, 50);

    ctx.fillStyle = '#f3c87c';
    ctx.font = "600 13px 'JetBrains Mono', Segoe UI, Arial";
    ctx.fillText(texto1, x + 28, y - 30);

    ctx.fillStyle = '#a39b85';
    ctx.font = "10px 'JetBrains Mono', Segoe UI, Arial";
    ctx.fillText(texto2.toUpperCase(), x + 28, y - 12);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function dibujar(tiempo) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dibujarFondo();
    dibujarEstrellas(tiempo);
    dibujarFugaces();
    dibujarGrafo();
    dibujarTooltip();
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (Math.random() < 0.012) {
      crearFugaz(screenX, screenY);
    }

    const mx = (screenX - offset.x) / scale;
    const my = (screenY - offset.y) / scale;

    if (dragging && lastMouse) {
      offset.x += e.clientX - lastMouse.x;
      offset.y += e.clientY - lastMouse.y;
      targetOffset.x = offset.x;
      targetOffset.y = offset.y;
      lastMouse = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
      return;
    }

    hoveredId = null;

    Object.values(nodos).forEach(n => {
      const dx = n.x - mx;
      const dy = n.y - my;

      if (Math.sqrt(dx * dx + dy * dy) < 13 / scale) {
        hoveredId = n.id;
      }
    });

    canvas.style.cursor = hoveredId
      ? (esConstelacion(hoveredId) ? 'help' : 'pointer')
      : 'grab';
  });

  canvas.addEventListener('click', () => {
    if (!hoveredId) return;
    // Constelaciones: no navegar — el tooltip extendido ya muestra su info
    if (esConstelacion(hoveredId)) return;
    window.location.href = `/Objetos/Detalle/${hoveredId}`;
  });

  canvas.addEventListener('mousedown', e => {
    dragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
  });

  canvas.addEventListener('mouseup', () => {
    dragging = false;
    lastMouse = null;
    canvas.style.cursor = hoveredId
      ? (esConstelacion(hoveredId) ? 'help' : 'pointer')
      : 'grab';
  });

  canvas.addEventListener('mouseleave', () => {
    dragging = false;
    lastMouse = null;
  });

  // ── Touch: drag (1 dedo) y pinch-zoom (2 dedos) ───────────────────────────

  let lastTouches = null;

  let touchStartPos = null;

  function hitTestTouch(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = (clientX - rect.left  - offset.x) / scale;
    const my = (clientY - rect.top   - offset.y) / scale;
    for (const n of Object.values(nodos)) {
      const dx = n.x - mx;
      const dy = n.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < 18 / scale) return n;
    }
    return null;
  }

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touches = Array.from(e.touches);
    lastTouches = touches.map(t => ({ x: t.clientX, y: t.clientY }));
    if (touches.length === 1) {
      touchStartPos = { x: touches[0].clientX, y: touches[0].clientY };
    } else {
      touchStartPos = null;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touches = Array.from(e.touches);

    if (touches.length === 1 && lastTouches && lastTouches.length === 1) {
      // Pan
      const dx = touches[0].clientX - lastTouches[0].x;
      const dy = touches[0].clientY - lastTouches[0].y;
      offset.x += dx;
      offset.y += dy;
      targetOffset.x = offset.x;
      targetOffset.y = offset.y;
    } else if (touches.length === 2 && lastTouches && lastTouches.length === 2) {
      // Pinch zoom
      const prev = lastTouches;
      const prevDist = Math.hypot(prev[1].x - prev[0].x, prev[1].y - prev[0].y);
      const currDist = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);
      const factor   = currDist / prevDist;

      const midX = (touches[0].clientX + touches[1].clientX) / 2;
      const midY = (touches[0].clientY + touches[1].clientY) / 2;
      const rect  = canvas.getBoundingClientRect();
      const cx    = midX - rect.left;
      const cy    = midY - rect.top;

      const worldX   = (cx - offset.x) / scale;
      const worldY   = (cy - offset.y) / scale;
      const newScale = Math.max(0.08, Math.min(5, scale * factor));
      scale    = newScale;
      targetScale = newScale;
      offset.x = cx - worldX * scale;
      offset.y = cy - worldY * scale;
      targetOffset.x = offset.x;
      targetOffset.y = offset.y;
    }

    lastTouches = touches.map(t => ({ x: t.clientX, y: t.clientY }));
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    const changed = Array.from(e.changedTouches);

    // Tap: 1 dedo, sin arrastre significativo
    if (e.touches.length === 0 && touchStartPos && changed.length === 1) {
      const dx = changed[0].clientX - touchStartPos.x;
      const dy = changed[0].clientY - touchStartPos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        const nodo = hitTestTouch(changed[0].clientX, changed[0].clientY);
        if (nodo) {
          hoveredId = nodo.id;
          if (!esConstelacion(nodo.id)) {
            window.location.href = `/Objetos/Detalle/${nodo.id}`;
          }
          // Constelaciones: hoveredId queda seteado → dibujarTooltip lo muestra
        }
      }
    }

    lastTouches = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
    if (e.touches.length === 0) { lastTouches = null; touchStartPos = null; }
  }, { passive: false });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - offset.x) / scale;
    const worldY = (mouseY - offset.y) / scale;

    const factor = e.deltaY < 0 ? 1.10 : 0.84;
    const newScale = Math.max(0.08, Math.min(5, scale * factor));

    scale    = newScale;
    targetScale = newScale;

    offset.x = mouseX - worldX * scale;
    offset.y = mouseY - worldY * scale;
    targetOffset.x = offset.x;
    targetOffset.y = offset.y;

  }, { passive: false });

  window.addEventListener('resize', () => {
    ajustarTamanio();
    crearEstrellas();
  });

  window.resaltarRutaGrafo = function (ruta) {
    highlightedNames = Array.isArray(ruta) ? ruta : [];

    if (highlightedNames.length === 0) return;

    const nodosRuta = highlightedNames
      .map(name => Object.values(nodos).find(n => n.nombre === name))
      .filter(n => n);

    if (nodosRuta.length === 0) return;

    const xs = nodosRuta.map(n => n.x);
    const ys = nodosRuta.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const w = Math.max(maxX - minX, 300);
    const h = Math.max(maxY - minY, 300);

    const padding = 150;
    const newScale = Math.min(
      (canvas.width  - padding * 2) / w,
      (canvas.height - padding * 2) / h,
      1.2
    );
    targetScale = Math.max(0.1, newScale);
    targetOffset.x = canvas.width  / 2 - centerX * targetScale;
    targetOffset.y = canvas.height / 2 - centerY * targetScale;
  };

  // ── Botones de zoom ────────────────────────────────────────────────────────

  function applyZoom(factor) {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;
    const worldX = (cx - offset.x) / scale;
    const worldY = (cy - offset.y) / scale;
    const newScale = Math.max(0.08, Math.min(5, scale * factor));
    targetScale    = newScale;
    targetOffset.x = cx - worldX * newScale;
    targetOffset.y = cy - worldY * newScale;
  }

  function resetView() {
    const todos = Object.values(nodos);
    if (todos.length === 0) {
      targetScale = 1;
      targetOffset.x = 0;
      targetOffset.y = 0;
      return;
    }

    const xs = todos.map(n => n.x);
    const ys = todos.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = Math.max(maxX - minX, 200);
    const h = Math.max(maxY - minY, 200);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const padding = 80;
    const newScale = Math.min(
      (canvas.width  - padding * 2) / w,
      (canvas.height - padding * 2) / h,
      1
    );
    targetScale    = Math.max(0.08, newScale);
    targetOffset.x = canvas.width  / 2 - centerX * targetScale;
    targetOffset.y = canvas.height / 2 - centerY * targetScale;

    highlightedNames = [];
  }

  const btnZoomIn  = document.getElementById('grafo-btn-zoomin');
  const btnZoomOut = document.getElementById('grafo-btn-zoomout');
  const btnReset   = document.getElementById('grafo-btn-reset');

  if (btnZoomIn)  btnZoomIn .addEventListener('click', () => applyZoom(1.35));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => applyZoom(1 / 1.35));
  if (btnReset)   btnReset  .addEventListener('click', resetView);

  // Cuántos pasos de simulación por frame — menos en móvil
  const PASOS_POR_FRAME = ('ontouchstart' in window) ? 1 : 2;
  const TICKS_TOTAL     = ('ontouchstart' in window) ? 120 : 180;
  const LERP_SNAP       = 0.001;

  function loop(tiempo) {
    if (tick < TICKS_TOTAL) {
      for (let p = 0; p < PASOS_POR_FRAME; p++) simularPaso();
      tick += PASOS_POR_FRAME;
      if (tick >= TICKS_TOTAL) tick = TICKS_TOTAL;
    }

    // Lerp suave hacia target; snap cuando está muy cerca
    if (!dragging) {
      const ds = targetScale    - scale;
      const dx = targetOffset.x - offset.x;
      const dy = targetOffset.y - offset.y;
      if (Math.abs(ds) > LERP_SNAP) scale    += ds * 0.12;
      else scale = targetScale;
      if (Math.abs(dx) > LERP_SNAP) offset.x += dx * 0.12;
      else offset.x = targetOffset.x;
      if (Math.abs(dy) > LERP_SNAP) offset.y += dy * 0.12;
      else offset.y = targetOffset.y;
    }

    dibujar(tiempo);
    requestAnimationFrame(loop);
  }

  // Esperar 1 frame para que CSS pinte el canvas antes de leer su tamaño
  requestAnimationFrame(() => {
    ajustarTamanio();
    crearEstrellas();
    inicializar();
    loop(0);
  });
})();