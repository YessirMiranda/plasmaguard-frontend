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
  // Simulación (luego se conectará al backend)
  alert('Función de carga de temperaturas en desarrollo.');
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
