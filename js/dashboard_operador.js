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
  // Aquí se conectará al backend de Render para obtener los datos reales
  // Por ahora, simulamos datos
  
  // Ejemplo de datos simulados
  const datos = {
    temp1: -29.5,
    temp2: -28.3,
    temp3: -127, // No conectado
    estadoAC: true,
    estadoRouter: true,
    estadoInternet: true,
    estadoBateria: true,
    estadoSD: true,
    estadoAlarma: false,
    fallas: []
  };
  
  actualizarTarjetas(datos);
}

function actualizarTarjetas(datos) {
  // Temperaturas
  actualizarCard('temp1', datos.temp1, 'estadoTemp1');
  actualizarCard('temp2', datos.temp2, 'estadoTemp2');
  actualizarCard('temp3', datos.temp3, 'estadoTemp3');
  
  // AC
  document.getElementById('estadoAC').innerText = datos.estadoAC ? '✅ Conectada' : '❌ Apagón';
  document.getElementById('cardAC').className = 'card ' + (datos.estadoAC ? 'ok' : 'alerta');
  
  // Router
  document.getElementById('estadoRouter').innerText = datos.estadoRouter ? '✅ Alimentado' : '❌ Cortado';
  document.getElementById('cardRouter').className = 'card ' + (datos.estadoRouter ? 'ok' : 'alerta');
  
  // Internet
  document.getElementById('estadoInternet').innerText = datos.estadoInternet ? '✅ Conectado' : '❌ Sin conexión';
  document.getElementById('cardInternet').className = 'card ' + (datos.estadoInternet ? 'ok' : 'alerta');
  
  // Batería
  document.getElementById('estadoBateria').innerText = datos.estadoBateria ? '✅ En buen estado' : '⚠️ Baja';
  document.getElementById('cardBateria').className = 'card ' + (datos.estadoBateria ? 'ok' : 'alerta');
  
  // SD
  document.getElementById('estadoSD').innerText = datos.estadoSD ? '✅ Detectada' : '❌ No detectada';
  document.getElementById('cardSD').className = 'card ' + (datos.estadoSD ? 'ok' : 'alerta');
  
  // Alarmas
  document.getElementById('estadoAlarma').innerText = datos.estadoAlarma ? '⚠️ Alarma activa' : '✅ Sin alarmas';
  document.getElementById('cardAlarma').className = 'card ' + (datos.estadoAlarma ? 'alerta' : 'ok');
}

function actualizarCard(idValor, valor, idEstado) {
  const elemento = document.getElementById(idValor);
  const estado = document.getElementById(idEstado);
  const card = document.getElementById('card' + idValor.charAt(0).toUpperCase() + idValor.slice(1));
  
  if (valor === -127) {
    elemento.innerText = 'No conectado';
    estado.innerText = 'Sensor desconectado';
    card.className = 'card alerta';
  } else {
    elemento.innerText = valor + ' °C';
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
