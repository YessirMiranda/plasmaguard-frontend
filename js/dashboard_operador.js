const BACKEND_URL = "https://plasmaguard-backend.onrender.com";
// ==================== VERIFICAR SESIÓN ====================
const sesion = verificarSesion('operador');
if (!sesion) {
  // La función verificarSesion ya redirige si no hay sesión
}

// ==================== BIENVENIDA PERSONALIZADA ====================
document.addEventListener('DOMContentLoaded', () => {
  if (sesion) {
    document.getElementById('bienvenida').innerText = `Bienvenido, ${sesion.nombre} (Operador)`;
  }
  
  // Iniciar actualización de datos
  cargarDatos();
  setInterval(cargarDatos, 10000);
  
  // Iniciar verificación de notificaciones
  cargarNotificaciones();
  setInterval(cargarNotificaciones, 30000);
});

// ==================== CAMBIO DE PESTAÑAS ====================
function cambiarTab(nombreTab, boton) {
  // Ocultar todas las pestañas
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Quitar active de todos los botones
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar la pestaña seleccionada
  document.getElementById('tab-' + nombreTab).classList.add('active');
  boton.classList.add('active');
}

// ==================== NOTIFICACIONES ====================
function toggleNotificaciones() {
  document.getElementById('panelNotificaciones').classList.toggle('hidden');
}

async function cargarNotificaciones() {
  // Simulación de notificaciones (luego se conectará al backend)
  const notificaciones = [];
  
  // Ejemplo: Si hay una alerta de temperatura
  // notificaciones.push({ tipo: 'alerta', mensaje: 'Temperatura alta en Sensor 1' });
  
  const contador = document.getElementById('contadorNotif');
  const lista = document.getElementById('listaNotificaciones');
  
  if (notificaciones.length > 0) {
    contador.innerText = notificaciones.length;
    lista.innerHTML = notificaciones.map(n => 
      `<div class="notificacion-item ${n.tipo}">${n.mensaje}</div>`
    ).join('');
  } else {
    contador.innerText = '0';
    lista.innerHTML = '<p class="sin-notificaciones">Sin notificaciones nuevas.</p>';
  }
}

// ==================== CARGA DE DATOS (Simulada) ====================
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
  // Temperaturas
  actualizarCard('temp1', d.sensor_1, 'estadoTemp1');
  actualizarCard('temp2', d.sensor_2, 'estadoTemp2');
  actualizarCard('temp3', d.sensor_3, 'estadoTemp3');
  
  // AC
  document.getElementById('estadoAC').innerText = d.estado_ac ? '✅ Conectada' : '❌ Apagón';
  document.getElementById('cardAC').className = 'card ' + (d.estado_ac ? 'ok' : 'alerta');
  
  // Router
  document.getElementById('estadoRouter').innerText = d.router_activo ? '✅ Alimentado' : '❌ Cortado';
  document.getElementById('cardRouter').className = 'card ' + (d.router_activo ? 'ok' : 'alerta');
  
  // Internet
  document.getElementById('estadoInternet').innerText = d.internet_activo ? '✅ Conectado' : '❌ Sin conexión';
  document.getElementById('cardInternet').className = 'card ' + (d.internet_activo ? 'ok' : 'alerta');
  
  // Batería (solo mostrar OK/NO OK, no voltaje)
  const bateriaOk = d.voltaje_bateria > 11.0;
  document.getElementById('estadoBateria').innerText = bateriaOk ? '✅ En buen estado' : '⚠️ Baja';
  document.getElementById('cardBateria').className = 'card ' + (bateriaOk ? 'ok' : 'alerta');
  
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

// ==================== FALLAS ====================
function cargarFallas() {
  // Simulación (luego se conectará al backend)
  alert('Función de carga de fallas en desarrollo.');
}

// ==================== TEMPERATURAS ====================
function cargarTemperaturas() {
  let graficaTemperaturas = null; // Variable global para la gráfica

async function cargarTemperaturas() {
  const inicio = document.getElementById('tempInicio').value;
  const fin = document.getElementById('tempFin').value;
  const intervalo = document.getElementById('tempIntervalo').value;
  const incluirFallas = document.getElementById('incluirFallas').checked;

  if (!inicio || !fin) {
    alert('Seleccione fecha y hora de inicio y fin.');
    return;
  }

  try {
    // Convertir a formato ISO
    const inicioISO = new Date(inicio).toISOString();
    const finISO = new Date(fin).toISOString();

    // Consultar temperaturas
    const url = `${BACKEND_URL}/api/temperaturas?inicio=${inicioISO}&fin=${finISO}&intervalo=${intervalo}`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    // Consultar fallas (si se solicitó)
    let fallas = [];
    if (incluirFallas) {
      const urlFallas = `${BACKEND_URL}/api/fallas?inicio=${inicioISO}&fin=${finISO}`;
      const respFallas = await fetch(urlFallas);
      fallas = await respFallas.json();
    }

    // Mostrar tabla
    mostrarTablaTemperaturas(datos, fallas);

    // Mostrar gráfica
    mostrarGraficaTemperaturas(datos);

  } catch (error) {
    console.error("Error cargando temperaturas:", error);
    alert('Error al cargar los datos. Revise la consola.');
  }
}

function mostrarTablaTemperaturas(datos, fallas) {
  const tbody = document.querySelector('#tablaTemperaturas tbody');
  tbody.innerHTML = '';

  if (datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No hay datos en este período.</td></tr>';
    return;
  }

  // Combinar datos y fallas en una sola lista ordenada por fecha
  let eventos = [];

  datos.forEach(d => {
    eventos.push({
      fecha: new Date(d.created_at),
      tipo: 'dato',
      s1: d.sensor_1,
      s2: d.sensor_2,
      s3: d.sensor_3
    });
  });

  fallas.forEach(f => {
    eventos.push({
      fecha: new Date(f.inicio),
      tipo: 'falla',
      falla: f
    });
  });

  // Ordenar por fecha
  eventos.sort((a, b) => a.fecha - b.fecha);

  // Renderizar
  eventos.forEach(e => {
    const tr = document.createElement('tr');

    if (e.tipo === 'dato') {
      const fechaStr = e.fecha.toLocaleString('es-BO');
      const s1 = (e.s1 === -127 || e.s1 === null) ? 'No conectado' : e.s1.toFixed(1) + ' °C';
      const s2 = (e.s2 === -127 || e.s2 === null) ? 'No conectado' : e.s2.toFixed(1) + ' °C';
      const s3 = (e.s3 === -127 || e.s3 === null) ? 'No conectado' : e.s3.toFixed(1) + ' °C';

      tr.innerHTML = `<td>${fechaStr}</td><td>${s1}</td><td>${s2}</td><td>${s3}</td>`;
    } else {
      const f = e.falla;
      const inicioStr = new Date(f.inicio).toLocaleString('es-BO');
      const finStr = new Date(f.fin).toLocaleString('es-BO');
      tr.className = 'fila-falla';
      tr.innerHTML = `<td>${inicioStr} - ${finStr}</td><td colspan="3">⚠️ Falla: ${f.detalle}</td>`;
    }

    tbody.appendChild(tr);
  });
}

function mostrarGraficaTemperaturas(datos) {
  const ctx = document.getElementById('graficaTemperaturas').getContext('2d');

  // Destruir gráfica anterior si existe
  if (graficaTemperaturas) {
    graficaTemperaturas.destroy();
  }

  // Preparar datos
  const etiquetas = datos.map(d => new Date(d.created_at).toLocaleString('es-BO'));
  const s1 = datos.map(d => (d.sensor_1 === -127 ? null : d.sensor_1));
  const s2 = datos.map(d => (d.sensor_2 === -127 ? null : d.sensor_2));
  const s3 = datos.map(d => (d.sensor_3 === -127 ? null : d.sensor_3));

  graficaTemperaturas = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: 'Sensor 1',
          data: s1,
          borderColor: '#4db8ff',
          backgroundColor: 'rgba(77, 184, 255, 0.1)',
          tension: 0.3,
          spanGaps: true
        },
        {
          label: 'Sensor 2',
          data: s2,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.3,
          spanGaps: true
        },
        {
          label: 'Sensor 3',
          data: s3,
          borderColor: '#ffd77d',
          backgroundColor: 'rgba(255, 215, 125, 0.1)',
          tension: 0.3,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#d0e5f5' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#a0d0f0', maxTicksLimit: 10 }
        },
        y: {
          ticks: { color: '#a0d0f0' }
        }
      }
    }
  });
}
}

// ==================== INFORMES ====================
function generarInforme() {
  // Simulación (luego se conectará al backend)
  alert('Generación de informe PDF en desarrollo.');
}

// ==================== REPORTES ====================
function generarReporte() {
  // Simulación (luego se conectará al backend)
  alert('Generación de reporte PDF en desarrollo.');
}

function actualizarBannerEstado(datos) {
  const banner = document.getElementById('bannerEstado');
  const icono = document.getElementById('bannerIcono');
  const mensaje = document.getElementById('bannerMensaje');

  // Prioridad: Alerta > Advertencia > OK
  if (datos.estado_alarma) {
    banner.className = 'banner-estado alerta';
    icono.innerText = '🚨';
    mensaje.innerText = 'ALARMA ACTIVA: ' + (datos.detalle_alarma || 'Revise el sistema inmediatamente.');
  } else if (!datos.estado_ac || !datos.router_activo || !datos.internet_activo || (datos.voltaje_bateria <= 11.0) || !datos.sd_detectada) {
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
