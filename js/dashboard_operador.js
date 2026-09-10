// ==================== CONFIGURACIÓN ====================
const BACKEND_URL = "https://plasmaguard-backend.onrender.com";
let graficaTemperaturas = null;

// ==================== VERIFICAR SESIÓN ====================
const sesion = verificarSesion('operador');

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (sesion) {
      document.getElementById('bienvenida').innerText = `Bienvenido, ${sesion.nombre} (Operador)`;
    }
    
    cargarDatos();
    setInterval(cargarDatos, 10000);
    
    cargarNotificaciones();
    setInterval(cargarNotificaciones, 30000);
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
  const notificaciones = [];
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
  
  document.getElementById('estadoAC').innerText = d.estado_ac ? '✅ Conectada' : '❌ Apagón';
  document.getElementById('cardAC').className = 'card ' + (d.estado_ac ? 'ok' : 'alerta');
  
  document.getElementById('estadoRouter').innerText = d.router_activo ? '✅ Alimentado' : '❌ Cortado';
  document.getElementById('cardRouter').className = 'card ' + (d.router_activo ? 'ok' : 'alerta');
  
  document.getElementById('estadoInternet').innerText = d.internet_activo ? '✅ Conectado' : '❌ Sin conexión';
  document.getElementById('cardInternet').className = 'card ' + (d.internet_activo ? 'ok' : 'alerta');
  
  const bateriaOk = d.voltaje_bateria > 11.0;
  document.getElementById('estadoBateria').innerText = bateriaOk ? '✅ En buen estado' : '⚠️ Baja';
  document.getElementById('cardBateria').className = 'card ' + (bateriaOk ? 'ok' : 'alerta');
  
  document.getElementById('estadoSD').innerText = d.sd_detectada ? '✅ Detectada' : '❌ No detectada';
  document.getElementById('cardSD').className = 'card ' + (d.sd_detectada ? 'ok' : 'alerta');
  
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

// ==================== FALLAS ====================
async function cargarFallas() {
  const inicio = document.getElementById('fallasInicio').value;
  const fin = document.getElementById('fallasFin').value;

  if (!inicio || !fin) {
    alert('Seleccione fecha y hora de inicio y fin.');
    return;
  }

  try {
    const inicioISO = inicio + ':00';
    const finISO = fin + ':00';

    const url = `${BACKEND_URL}/api/fallas?inicio=${inicioISO}&fin=${finISO}`;
    console.log("Consultando fallas:", url);

    const respuesta = await fetch(url);
    const fallas = await respuesta.json();
    console.log("Fallas recibidas:", fallas);

    const tbody = document.querySelector('#tablaFallas tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(fallas) || fallas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No hay fallas en este período.</td></tr>';
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
    console.error("Error cargando fallas:", error);
    alert('Error al cargar las fallas. Revise la consola.');
  }
}

// ==================== TEMPERATURAS ====================
async function cargarTemperaturas() {
  const inicio = document.getElementById('tempInicio').value;
  const fin = document.getElementById('tempFin').value;
  const intervalo = document.getElementById('tempIntervalo').value;
  const incluirFallas = document.getElementById('incluirFallas').checked;

  console.log("Filtros:", { inicio, fin, intervalo, incluirFallas });

  if (!inicio || !fin) {
    alert('Seleccione fecha y hora de inicio y fin.');
    return;
  }

  try {
    const inicioISO = inicio + ':00';
    const finISO = fin + ':00';

    const url = `${BACKEND_URL}/api/temperaturas?inicio=${inicioISO}&fin=${finISO}&intervalo=${intervalo}`;
    console.log("Consultando:", url);

    const respuesta = await fetch(url);
    console.log("Respuesta HTTP:", respuesta.status);

    const datos = await respuesta.json();
    console.log("Datos recibidos:", datos);

    if (!Array.isArray(datos) || datos.length === 0) {
      document.querySelector('#tablaTemperaturas tbody').innerHTML = 
        '<tr><td colspan="4">No hay datos en este período.</td></tr>';
      return;
    }

    let fallas = [];
    if (incluirFallas) {
      const urlFallas = `${BACKEND_URL}/api/fallas?inicio=${inicioISO}&fin=${finISO}`;
      const respFallas = await fetch(urlFallas);
      fallas = await respFallas.json();
      console.log("Fallas recibidas:", fallas);
    }

    mostrarTablaTemperaturas(datos, fallas);
    mostrarGraficaTemperaturas(datos);

  } catch (error) {
    console.error("Error cargando temperaturas:", error);
    alert('Error al cargar los datos. Revise la consola.');
  }
}

function mostrarTablaTemperaturas(datos, fallas) {
  const tbody = document.querySelector('#tablaTemperaturas tbody');
  tbody.innerHTML = '';

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

  eventos.sort((a, b) => a.fecha - b.fecha);

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

  if (graficaTemperaturas) {
    graficaTemperaturas.destroy();
  }

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

// ==================== INFORMES ====================
function generarInforme() {
  alert('Generación de informe PDF en desarrollo.');
}

// ==================== REPORTES ====================
function generarReporte() {
  alert('Generación de reporte PDF en desarrollo.');
}
