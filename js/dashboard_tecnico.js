// ==================== CONFIGURACIÓN ====================
const BACKEND_URL = "https://plasmaguard-backend.onrender.com";
let graficaVoltaje = null;
let modoPruebasActivo = false;

// ==================== VERIFICAR SESIÓN ====================
const sesion = verificarSesion('tecnico');

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (sesion) {
      document.getElementById('bienvenida').innerText = `Bienvenido, ${sesion.nombre} (Técnico)`;
    }

    cargarGraficaVoltaje();
    setInterval(cargarGraficaVoltaje, 60000); // Actualizar cada minuto
    
    cargarDatos();
    setInterval(cargarDatos, 10000);

    cargarNotificaciones();
    setInterval(cargarNotificaciones, 30000);

    cargarNotificacionesHistorial();
  } catch (error) {
    console.error("Error en inicialización:", error);
  }
});

// ==================== CAMBIO DE PESTAÑAS ====================
function cambiarTab(nombreTab, boton) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById('tab-' + nombreTab).classList.add('active');
  boton.classList.add('active');
}

// ==================== NOTIFICACIONES ====================
function toggleNotificaciones() {
  document.getElementById('panelNotificaciones').classList.toggle('hidden');
}

async function cargarNotificaciones() {
  try {
    const respUltimo = await fetch(BACKEND_URL + "/api/ultimo");
    const datosUltimo = await respUltimo.json();

    const notificaciones = [];

    if (datosUltimo.length > 0) {
      const d = datosUltimo[0];

      if (d.sensor_1 === -127) notificaciones.push({ tipo: 'alerta', mensaje: '⚠️ Sensor 1 desconectado' });
      if (d.sensor_2 === -127) notificaciones.push({ tipo: 'alerta', mensaje: '⚠️ Sensor 2 desconectado' });
      if (d.sensor_3 === -127) notificaciones.push({ tipo: 'alerta', mensaje: '⚠️ Sensor 3 desconectado' });

      if (d.sensor_1 !== -127 && (d.sensor_1 > -20 || d.sensor_1 < -40)) {
        notificaciones.push({ tipo: 'alerta', mensaje: `🌡️ Temperatura anormal en Sensor 1: ${d.sensor_1.toFixed(1)}°C` });
      }
      if (d.sensor_2 !== -127 && (d.sensor_2 > -20 || d.sensor_2 < -40)) {
        notificaciones.push({ tipo: 'alerta', mensaje: `🌡️ Temperatura anormal en Sensor 2: ${d.sensor_2.toFixed(1)}°C` });
      }
      if (d.sensor_3 !== -127 && (d.sensor_3 > -20 || d.sensor_3 < -40)) {
        notificaciones.push({ tipo: 'alerta', mensaje: `🌡️ Temperatura anormal en Sensor 3: ${d.sensor_3.toFixed(1)}°C` });
      }

      if (!d.estado_ac) notificaciones.push({ tipo: 'alerta', mensaje: '⚡ Apagón detectado. Sistema en modo batería.' });
      if (!d.router_activo) notificaciones.push({ tipo: 'advertencia', mensaje: '📡 Router cortado por batería baja.' });
      if (!d.internet_activo) notificaciones.push({ tipo: 'advertencia', mensaje: '🌐 Sin conexión a internet.' });
      if (d.voltaje_bateria <= 11.0) notificaciones.push({ tipo: 'advertencia', mensaje: '🔋 Batería baja. Voltaje: ' + d.voltaje_bateria.toFixed(2) + 'V' });
      if (!d.sd_detectada) notificaciones.push({ tipo: 'advertencia', mensaje: '💾 MicroSD no detectada.' });
    }

    const contador = document.getElementById('contadorNotif');
    const lista = document.getElementById('listaNotificaciones');

    if (notificaciones.length > 0) {
      contador.innerText = notificaciones.length;
      contador.style.display = 'inline-block';
      lista.innerHTML = notificaciones.map(n =>
        `<div class="notificacion-item ${n.tipo}">${n.mensaje}</div>`
      ).join('');
    } else {
      contador.innerText = '0';
      contador.style.display = 'none';
      lista.innerHTML = '<p class="sin-notificaciones">Sin notificaciones nuevas.</p>';
    }
  } catch (error) {
    console.error("Error cargando notificaciones:", error);
  }
}

// ==================== CARGA DE DATOS ====================
async function cargarDatos() {
  try {
    const respuesta = await fetch(BACKEND_URL + "/api/ultimo");
    const datos = await respuesta.json();

    if (datos.length > 0) {
      actualizarTarjetas(datos[0]);
      actualizarBannerEstado(datos[0]);
    }
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

function actualizarTarjetas(d) {
  actualizarCard('temp1', d.sensor_1, 'estadoTemp1');
  actualizarCard('temp2', d.sensor_2, 'estadoTemp2');
  actualizarCard('temp3', d.sensor_3, 'estadoTemp3');

  // Voltaje de batería (valor exacto para técnico)
  document.getElementById('voltajeBateria').innerText = d.voltaje_bateria ? d.voltaje_bateria.toFixed(2) + ' V' : '---';
  document.getElementById('voltajeBateriaDetalle').innerText = d.voltaje_bateria > 11.0 ? 'En buen estado' : 'Baja';

  // AC
  document.getElementById('estadoAC').innerText = d.estado_ac ? '✅ Conectada' : '❌ Apagón';
  document.getElementById('cardAC').className = 'card ' + (d.estado_ac ? 'ok' : 'alerta');

  // Router
  document.getElementById('estadoRouter').innerText = d.router_activo ? '✅ Alimentado' : '❌ Cortado';
  document.getElementById('cardRouter').className = 'card ' + (d.router_activo ? 'ok' : 'alerta');

  // Internet
  document.getElementById('estadoInternet').innerText = d.internet_activo ? '✅ Conectado' : '❌ Sin conexión';
  document.getElementById('cardInternet').className = 'card ' + (d.internet_activo ? 'ok' : 'alerta');

  // SD
  document.getElementById('estadoSD').innerText = d.sd_detectada ? '✅ Detectada' : '❌ No detectada';
  document.getElementById('cardSD').className = 'card ' + (d.sd_detectada ? 'ok' : 'alerta');

  // Alarmas
  const hayAlarma = !d.estado_ac || (d.sensor_1 !== -127 && (d.sensor_1 > -20 || d.sensor_1 < -40));
  document.getElementById('estadoAlarma').innerText = hayAlarma ? '⚠️ Alarma activa' : '✅ Sin alarmas';
  document.getElementById('cardAlarma').className = 'card ' + (hayAlarma ? 'alerta' : 'ok');
}

function actualizarCard(idValor, valor, idEstado) {
  const elemento = document.getElementById(idValor);
  const estado = document.getElementById(idEstado);
  const card = document.getElementById('card' + idValor.charAt(0).toUpperCase() + idValor.slice(1));

  if (valor === -127 || valor === null || valor === undefined) {
    elemento.innerText = 'No conectado';
    estado.innerText = 'Sensor desconectado';
    card.className = 'card alerta';
  } else {
    elemento.innerText = valor.toFixed(1) + ' °C';
    estado.innerText = 'Lectura normal';
    card.className = 'card ok';
  }
}

function actualizarBannerEstado(datos) {
  const banner = document.getElementById('bannerEstado');
  const icono = document.getElementById('bannerIcono');
  const mensaje = document.getElementById('bannerMensaje');

  if (!datos.estado_ac || !datos.router_activo || !datos.internet_activo || (datos.voltaje_bateria <= 11.0) || !datos.sd_detectada) {
    banner.className = 'banner-estado advertencia';
    icono.innerText = '⚠️';
    let advertencias = [];
    if (!datos.estado_ac) advertencias.push('Sin energía eléctrica');
    if (!datos.router_activo) advertencias.push('Router cortado');
    if (!datos.internet_activo) advertencias.push('Sin conexión a internet');
    if (datos.voltaje_bateria <= 11.0) advertencias.push('Batería baja');
    if (!datos.sd_detectada) advertencias.push('MicroSD no detectada');
    mensaje.innerText = 'Advertencia: ' + advertencias.join(', ') + '.';
  } else {
    banner.className = 'banner-estado ok';
    icono.innerText = '✅';
    mensaje.innerText = 'Sistema operando con normalidad.';
  }
}

// ==================== NOTIFICACIONES HISTORIAL ====================
async function cargarNotificacionesHistorial() {
  const inicio = document.getElementById('notifInicio').value;
  const fin = document.getElementById('notifFin').value;

  if (!inicio || !fin) {
    alert('Seleccione fecha y hora de inicio y fin.');
    return;
  }

  try {
    const inicioISO = inicio + ':00';
    const finISO = fin + ':00';

    const url = `${BACKEND_URL}/api/fallas?inicio=${inicioISO}&fin=${finISO}`;
    const respuesta = await fetch(url);
    const fallas = await respuesta.json();

    const tbody = document.querySelector('#tablaNotificaciones tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(fallas) || fallas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No hay notificaciones en este período.</td></tr>';
      return;
    }

    fallas.forEach(f => {
      const tr = document.createElement('tr');
      const inicioStr = new Date(f.inicio).toLocaleString('es-BO');
      const finStr = new Date(f.fin).toLocaleString('es-BO');
      const duracion = f.duracion ? `${Math.round(f.duracion / 60)} min` : '---';

      tr.innerHTML = `
        <td>${inicioStr}</td>
        <td>${finStr}</td>
        <td>${f.tipo}</td>
        <td>${f.detalle}</td>
        <td>${duracion}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error cargando notificaciones:", error);
    alert('Error al cargar las notificaciones.');
  }
}

async function borrarNotificaciones() {
  if (!confirm('¿Está seguro de que desea borrar TODAS las notificaciones? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    // Aquí se implementará la lógica para borrar las notificaciones de Supabase
    alert('Función de borrado en desarrollo. Se implementará con Supabase.');
    // await fetch(BACKEND_URL + '/api/fallas/borrar', { method: 'DELETE' });
    cargarNotificacionesHistorial();
  } catch (error) {
    console.error("Error borrando notificaciones:", error);
  }
}

// ==================== TESTER ====================
async function activarModoPruebas() {
  if (!confirm('¿Activar Modo Pruebas? Los sensores dejarán de leerse y los datos NO se enviarán a la nube.')) {
    return;
  }

  modoPruebasActivo = true;
  document.getElementById('bannerModoPruebas').classList.remove('hidden');

  try {
    await fetch(BACKEND_URL + '/api/comando', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comando: 'modo_pruebas' })
    });
    alert('✅ Modo Pruebas activado. El ESP32 dejará de leer sensores.');
  } catch (error) {
    console.error("Error activando modo pruebas:", error);
  }
}

async function salirModoPruebas() {
  modoPruebasActivo = false;
  document.getElementById('bannerModoPruebas').classList.add('hidden');

  try {
    await fetch(BACKEND_URL + '/api/comando', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comando: 'modo_normal' })
    });
    alert('✅ Modo Normal restaurado.');
  } catch (error) {
    console.error("Error saliendo de modo pruebas:", error);
  }
}

async function enviarComandoTester(comando, valor) {
  if (!modoPruebasActivo) {
    alert('⚠️ Debe activar el Modo Pruebas primero.');
    return;
  }

  try {
    await fetch(BACKEND_URL + '/api/comando', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comando: comando, valor: valor || null })
    });
  } catch (error) {
    console.error("Error enviando comando:", error);
  }
}

function probarLED(color, estado) {
  enviarComandoTester(`led_${color}_${estado ? 'on' : 'off'}`);
}

function probarSecuenciaLEDs(numero) {
  enviarComandoTester(`secuencia_leds_${numero}`);
}

function probarBuzzer(estado) {
  enviarComandoTester(`buzzer_${estado ? 'on' : 'off'}`);
}

function probarMelodia(numero) {
  enviarComandoTester(`melodia_buzzer_${numero}`);
}

function probarRele(estado) {
  enviarComandoTester(`rele_${estado ? 'on' : 'off'}`);
}

// ==================== DOCUMENTACIÓN ====================
function generarDocumentoFalla() {
  const tipo = document.getElementById('tipoFalla').value;
  const descripcion = document.getElementById('descripcionFalla').value.trim();
  const solucion = document.getElementById('solucionFalla').value.trim();
  const solucionado = document.querySelector('input[name="solucionado"]:checked');

  if (!descripcion) {
    alert('Por favor, describa la falla.');
    return;
  }

  if (!solucionado) {
    alert('Indique si la falla se solucionó o no.');
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('❌ Error: La librería jsPDF no está cargada.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const sesion = obtenerSesion();
  const nombreUsuario = sesion ? sesion.nombre : 'Técnico';
  const institucion = (sesion && sesion.institucion && sesion.institucion.trim() !== '')
    ? sesion.institucion
    : 'Banco de Sangre de Referencia Departamental de Potosí';

  const hoy = new Date();
  const fechaEmision = `Potosí, ${hoy.getDate()} de ${obtenerMes(hoy.getMonth())} del ${hoy.getFullYear()}`;

  // Encabezado
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('PLASMAGUARD', 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.text('Documentación de Falla', 105, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.text(institucion, 105, 32, { align: 'center' });

  doc.setDrawColor(77, 184, 255);
  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);

  // Datos
  let y = 50;
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  doc.text(`Fecha: ${fechaEmision}`, 15, y); y += 7;
  doc.text(`Técnico: ${nombreUsuario}`, 15, y); y += 7;
  doc.text(`Tipo de Falla: ${tipo}`, 15, y); y += 10;

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Descripción de la Falla:', 15, y); y += 7;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const lineasDesc = doc.splitTextToSize(descripcion, 170);
  lineasDesc.forEach(linea => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.text(linea, 20, y);
    y += 6;
  });

  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Solución Aplicada:', 15, y); y += 7;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const lineasSol = doc.splitTextToSize(solucion || 'No especificada', 170);
  lineasSol.forEach(linea => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.text(linea, 20, y);
    y += 6;
  });

  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`¿Se solucionó? ${solucionado.value === 'si' ? 'SÍ' : 'NO'}`, 15, y);

  // Firma
  y += 40;
  if (y > 220) { doc.addPage(); y = 40; }

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('_____________________________', 60, y);
  doc.text('Firma del Técnico', 75, y + 10);
  doc.text(nombreUsuario, 75, y + 16);

  // Pie de página
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: 'center' });
    doc.text('PlasmaGuard - Sistema de Monitoreo de Cadena de Frío', 105, 295, { align: 'center' });
  }

  const nombreArchivo = `Documentacion_Falla_${tipo}_${hoy.getFullYear()}${String(hoy.getMonth()+1).padStart(2,'0')}${String(hoy.getDate()).padStart(2,'0')}.pdf`;
  doc.save(nombreArchivo);

  document.getElementById('vistaPreviaDoc').innerHTML =
    `<p>✅ Documento generado con éxito. <br>Se descargó el archivo: <strong>${nombreArchivo}</strong></p>`;
}

// ==================== MANUAL ====================
function descargarManual() {
  // URL del manual (debes subirlo a GitHub, Supabase Storage, o un servidor)
  const urlManual = 'https://tu-servidor.com/manual_plasmaguard.pdf';
  window.open(urlManual, '_blank');
}

function verManualEnPagina() {
  const visor = document.getElementById('visorManual');
  const iframe = document.getElementById('iframeManual');

  if (visor.classList.contains('hidden')) {
    // URL del manual
    iframe.src = 'https://tu-servidor.com/manual_plasmaguard.pdf';
    visor.classList.remove('hidden');
  } else {
    visor.classList.add('hidden');
    iframe.src = '';
  }
}

// ==================== FUNCIÓN AUXILIAR: NOMBRE DEL MES ====================
function obtenerMes(numeroMes) {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return meses[numeroMes];
}

async function cargarGraficaVoltaje() {
  try {
    const fin = new Date().toISOString();
    const inicio = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Últimas 24h

    const url = `${BACKEND_URL}/api/temperaturas?inicio=${inicio}&fin=${fin}&intervalo=3600`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    if (!Array.isArray(datos) || datos.length === 0) return;

    const ctx = document.getElementById('graficaVoltaje').getContext('2d');

    if (graficaVoltaje) graficaVoltaje.destroy();

    const etiquetas = datos.map(d => new Date(d.created_at).toLocaleString('es-BO'));
    const voltajes = datos.map(d => d.voltaje_bateria);

    graficaVoltaje = new Chart(ctx, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Voltaje de Batería (V)',
          data: voltajes,
          borderColor: '#4db8ff',
          backgroundColor: 'rgba(77, 184, 255, 0.1)',
          tension: 0.3,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#d0e5f5' } }
        },
        scales: {
          x: { ticks: { color: '#a0d0f0', maxTicksLimit: 10 } },
          y: { ticks: { color: '#a0d0f0' } }
        }
      }
    });
  } catch (error) {
    console.error("Error cargando gráfica de voltaje:", error);
  }
}
