// ==================== CONFIGURACIÓN ====================
const BACKEND_URL = "https://plasmaguard-backend.onrender.com";
let graficaTemperaturasAdmin = null;
let modoPruebasActivo = false;

// ==================== VERIFICAR SESIÓN ====================
const sesion = verificarSesion('admin');

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  if (sesion) {
    document.getElementById('bienvenida').innerText = `Bienvenido, ${sesion.nombre} (Administrador)`;
  }

  cargarDatos();
  setInterval(cargarDatos, 10000);

  cargarNotificaciones();
  setInterval(cargarNotificaciones, 30000);

  cargarPanelGlobal();
  cargarGraficaTemperaturas();
  cargarUsuarios();
  cargarAuditoria();
});

// ==================== CAMBIO DE PESTAÑAS ====================
function cambiarTab(nombreTab, boton) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + nombreTab).classList.add('active');
  boton.classList.add('active');
}

// ==================== NOTIFICACIONES ====================
function toggleNotificaciones() {
  document.getElementById('panelNotificaciones').classList.toggle('hidden');
}

async function cargarNotificaciones() {
  try {
    const resp = await fetch(BACKEND_URL + "/api/ultimo");
    const datos = await resp.json();
    const notificaciones = [];

    if (datos.length > 0) {
      const d = datos[0];
      if (d.sensor_1 === -127) notificaciones.push({ tipo: 'alerta', mensaje: '⚠️ Sensor 1 desconectado' });
      if (d.sensor_2 === -127) notificaciones.push({ tipo: 'alerta', mensaje: '⚠️ Sensor 2 desconectado' });
      if (d.sensor_3 === -127) notificaciones.push({ tipo: 'alerta', mensaje: '⚠️ Sensor 3 desconectado' });
      if (!d.estado_ac) notificaciones.push({ tipo: 'alerta', mensaje: '⚡ Apagón detectado' });
      if (!d.router_activo) notificaciones.push({ tipo: 'advertencia', mensaje: '📡 Router cortado' });
      if (!d.internet_activo) notificaciones.push({ tipo: 'advertencia', mensaje: '🌐 Sin internet' });
      if (d.voltaje_bateria <= 11.0) notificaciones.push({ tipo: 'advertencia', mensaje: '🔋 Batería baja' });
      if (!d.sd_detectada) notificaciones.push({ tipo: 'advertencia', mensaje: '💾 MicroSD no detectada' });
    }

    const contador = document.getElementById('contadorNotif');
    const lista = document.getElementById('listaNotificaciones');

    if (notificaciones.length > 0) {
      contador.innerText = notificaciones.length;
      contador.style.display = 'inline-block';
      lista.innerHTML = notificaciones.map(n => `<div class="notificacion-item ${n.tipo}">${n.mensaje}</div>`).join('');
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
    const resp = await fetch(BACKEND_URL + "/api/ultimo");
    const datos = await resp.json();
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

  document.getElementById('voltajeBateria').innerText = d.voltaje_bateria ? d.voltaje_bateria.toFixed(2) + ' V' : '---';
  document.getElementById('voltajeBateriaDetalle').innerText = d.voltaje_bateria > 11.0 ? 'En buen estado' : 'Baja';

  document.getElementById('estadoAC').innerText = d.estado_ac ? '✅ Conectada' : '❌ Apagón';
  document.getElementById('cardAC').className = 'card ' + (d.estado_ac ? 'ok' : 'alerta');

  document.getElementById('estadoRouter').innerText = d.router_activo ? '✅ Alimentado' : '❌ Cortado';
  document.getElementById('cardRouter').className = 'card ' + (d.router_activo ? 'ok' : 'alerta');

  document.getElementById('estadoInternet').innerText = d.internet_activo ? '✅ Conectado' : '❌ Sin conexión';
  document.getElementById('cardInternet').className = 'card ' + (d.internet_activo ? 'ok' : 'alerta');

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
    let adv = [];
    if (!datos.estado_ac) adv.push('Sin energía');
    if (!datos.router_activo) adv.push('Router cortado');
    if (!datos.internet_activo) adv.push('Sin internet');
    if (datos.voltaje_bateria <= 11.0) adv.push('Batería baja');
    if (!datos.sd_detectada) adv.push('MicroSD no detectada');
    mensaje.innerText = 'Advertencia: ' + adv.join(', ') + '.';
  } else {
    banner.className = 'banner-estado ok';
    icono.innerText = '✅';
    mensaje.innerText = 'Sistema operando con normalidad.';
  }
}

// ==================== PANEL DE CONTROL GLOBAL ====================
async function cargarPanelGlobal() {
  try {
    const respU = await fetch(BACKEND_URL + "/api/usuarios");
    const usuarios = await respU.json();
    document.getElementById('totalUsuarios').innerText = usuarios.length;

    const respR = await fetch(BACKEND_URL + "/api/ultimo");
    const registros = await respR.json();
    if (registros.length > 0) {
      document.getElementById('ultimaSync').innerText = new Date(registros[0].created_at).toLocaleString('es-BO');
    }

    // Simulación de espacio usado (se puede obtener de Supabase)
    document.getElementById('totalRegistros').innerText = '---';
    document.getElementById('espacioUsado').innerText = '---';
  } catch (error) {
    console.error("Error cargando panel global:", error);
  }
}

// ==================== GRÁFICA DE TEMPERATURAS ====================
async function cargarGraficaTemperaturas() {
  const periodo = document.getElementById('graficaPeriodo').value;
  const sensor = document.getElementById('graficaSensor').value;

  try {
    const fin = new Date().toISOString();
    const inicio = new Date(Date.now() - periodo * 60 * 60 * 1000).toISOString();
    const intervalo = Math.floor((periodo * 3600) / 100);

    const url = `${BACKEND_URL}/api/temperaturas?inicio=${inicio}&fin=${fin}&intervalo=${intervalo}`;
    const resp = await fetch(url);
    const datos = await resp.json();

    if (!Array.isArray(datos) || datos.length === 0) return;

    const ctx = document.getElementById('graficaTemperaturasAdmin').getContext('2d');
    if (graficaTemperaturasAdmin) graficaTemperaturasAdmin.destroy();

    const etiquetas = datos.map(d => new Date(d.created_at).toLocaleString('es-BO'));
    const datasets = [];

    if (sensor === 'todos' || sensor === '1') {
      datasets.push({ label: 'Sensor 1', data: datos.map(d => d.sensor_1 === -127 ? null : d.sensor_1), borderColor: '#4db8ff', tension: 0.3, spanGaps: true });
    }
    if (sensor === 'todos' || sensor === '2') {
      datasets.push({ label: 'Sensor 2', data: datos.map(d => d.sensor_2 === -127 ? null : d.sensor_2), borderColor: '#ff6b6b', tension: 0.3, spanGaps: true });
    }
    if (sensor === 'todos' || sensor === '3') {
      datasets.push({ label: 'Sensor 3', data: datos.map(d => d.sensor_3 === -127 ? null : d.sensor_3), borderColor: '#ffd77d', tension: 0.3, spanGaps: true });
    }

    graficaTemperaturasAdmin = new Chart(ctx, {
      type: 'line',
      data: { labels: etiquetas, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#d0e5f5' } } },
        scales: {
          x: { ticks: { color: '#a0d0f0', maxTicksLimit: 10 } },
          y: { ticks: { color: '#a0d0f0' } }
        }
      }
    });
  } catch (error) {
    console.error("Error cargando gráfica:", error);
  }
}

// ==================== TESTER ====================
async function activarModoPruebas() {
  if (!confirm('¿Activar Modo Pruebas?')) return;
  modoPruebasActivo = true;
  document.getElementById('bannerModoPruebas').classList.remove('hidden');
  await enviarComando('modo_pruebas');
}

async function salirModoPruebas() {
  modoPruebasActivo = false;
  document.getElementById('bannerModoPruebas').classList.add('hidden');
  await enviarComando('modo_normal');
}

async function simularFalla(tipo) {
  if (!modoSimulacionActivo) {
    alert('⚠️ Debe activar el Modo Simulación primero.');
    return;
  }
  await enviarComando(`simular_${tipo}`);
  alert(`✅ Simulación "${tipo}" activada.`);
}

async function probarLED(color, estado) {
  if (!modoPruebasActivo) { alert('Active Modo Pruebas primero.'); return; }
  await enviarComando(`led_${color}_${estado ? 'on' : 'off'}`);
}

async function probarSecuenciaLEDs(num) {
  if (!modoPruebasActivo) { alert('Active Modo Pruebas primero.'); return; }
  await enviarComando(`secuencia_leds_${num}`);
}

async function probarBuzzer(estado) {
  if (!modoPruebasActivo) { alert('Active Modo Pruebas primero.'); return; }
  await enviarComando(`buzzer_${estado ? 'on' : 'off'}`);
}

async function probarMelodia(num) {
  if (!modoPruebasActivo) { alert('Active Modo Pruebas primero.'); return; }
  await enviarComando(`melodia_buzzer_${num}`);
}

async function probarRele(estado) {
  if (!modoPruebasActivo) { alert('Active Modo Pruebas primero.'); return; }
  await enviarComando(`rele_${estado ? 'on' : 'off'}`);
}

async function enviarComando(comando, valor) {
  try {
    await fetch(BACKEND_URL + '/api/comando', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comando, valor: valor || null })
    });
  } catch (error) {
    console.error("Error enviando comando:", error);
  }
}

// ==================== VARIABLES ====================
async function guardarVariables() {
  const tempMax = document.getElementById('varTempMax').value;
  const tempMin = document.getElementById('varTempMin').value;
  const voltCorte = document.getElementById('varVoltajeCorte').value;
  const voltRestaurar = document.getElementById('varVoltajeRestaurar').value;
  const intervalo = document.getElementById('varIntervalo').value;

  await enviarComando('set_variables', `${tempMax},${tempMin},${voltCorte},${voltRestaurar},${intervalo}`);
  alert('✅ Variables guardadas. Se enviarán al ESP32.');
}

// ==================== USUARIOS ====================
async function cargarUsuarios() {
  const filtro = document.getElementById('filtroUsuario').value;
  try {
    let url = BACKEND_URL + '/api/usuarios';
    if (filtro !== 'todos') url += `?rol=eq.${filtro}`;
    const resp = await fetch(url);
    const usuarios = await resp.json();

    const tbody = document.querySelector('#tablaUsuarios tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No hay usuarios.</td></tr>';
      return;
    }

    usuarios.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.usuario}</td>
        <td>${u.nombre}</td>
        <td>${u.rol}</td>
        <td>${u.institucion || '---'}</td>
        <td>
          <button class="btn-tester" onclick="editarUsuario(${u.id})">✏️</button>
          <button class="btn-tester btn-borrar" onclick="eliminarUsuario(${u.id}, '${u.usuario}')">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
}

function editarUsuario(id) {
  alert('Función de edición en desarrollo. ID: ' + id);
}

function eliminarUsuario(id, usuario) {
  if (!confirm(`¿Eliminar al usuario ${usuario}? Esta acción borrará TODOS sus datos.`)) return;
  
  const confirmacion = prompt(`Escriba "ELIMINAR" para confirmar el borrado de ${usuario}:`);
  if (confirmacion !== 'ELIMINAR') {
    alert('Borrado cancelado.');
    return;
  }

  fetch(BACKEND_URL + `/api/usuarios/${id}`, { method: 'DELETE' })
    .then(resp => {
      if (resp.ok) {
        alert('✅ Usuario eliminado.');
        cargarUsuarios();
      } else {
        alert('❌ Error al eliminar.');
      }
    })
    .catch(err => console.error(err));
}

function crearUsuarioAdmin() {
  window.location.href = 'crear_cuenta.html';
}

// ==================== DATOS ADMIN ====================
async function cargarDatosAdmin() {
  const inicio = document.getElementById('adminDataInicio').value;
  const fin = document.getElementById('adminDataFin').value;

  if (!inicio || !fin) { alert('Seleccione fechas.'); return; }

  try {
    const inicioISO = inicio + ':00';
    const finISO = fin + ':00';
    const url = `${BACKEND_URL}/api/temperaturas?inicio=${inicioISO}&fin=${finISO}&intervalo=60`;
    const resp = await fetch(url);
    const datos = await resp.json();

    const tbody = document.querySelector('#tablaDatosAdmin tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(datos) || datos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No hay datos.</td></tr>';
      return;
    }

    datos.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.id}</td>
        <td>${new Date(d.created_at).toLocaleString('es-BO')}</td>
        <td>${d.sensor_1 === -127 ? '---' : d.sensor_1.toFixed(1)}</td>
        <td>${d.sensor_2 === -127 ? '---' : d.sensor_2.toFixed(1)}</td>
        <td>${d.sensor_3 === -127 ? '---' : d.sensor_3.toFixed(1)}</td>
        <td>${d.voltaje_bateria ? d.voltaje_bateria.toFixed(2) : '---'}</td>
        <td><button class="btn-tester btn-borrar" onclick="eliminarDato(${d.id})">🗑️</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

function eliminarDato(id) {
  if (!confirm('¿Eliminar este registro?')) return;
  fetch(BACKEND_URL + `/api/datos/${id}`, { method: 'DELETE' })
    .then(() => { alert('✅ Registro eliminado.'); cargarDatosAdmin(); })
    .catch(err => console.error(err));
}

async function borrarDatosAdmin() {
  const inicio = document.getElementById('adminDataInicio').value;
  const fin = document.getElementById('adminDataFin').value;
  if (!inicio || !fin) { alert('Seleccione fechas.'); return; }
  if (!confirm('¿Borrar TODOS los datos del rango seleccionado?')) return;

  const inicioISO = inicio + ':00';
  const finISO = fin + ':00';
  await fetch(`${BACKEND_URL}/api/fallas/borrar?inicio=${inicioISO}&fin=${finISO}`, { method: 'DELETE' });
  alert('✅ Datos borrados.');
  cargarDatosAdmin();
}

async function guardarAutoBorrado() {
  const frecuencia = document.getElementById('autoBorrado').value;
  const dias = document.getElementById('autoBorradoDias').value;
  await fetch(BACKEND_URL + '/api/config/autoborrado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frecuencia, dias })
  });
  alert('✅ Configuración de borrado automático guardada.');
}

// ==================== AUDITORÍA ====================
async function cargarAuditoria() {
  try {
    const resp = await fetch(BACKEND_URL + '/api/auditoria');
    const registros = await resp.json();

    const tbody = document.querySelector('#tablaAuditoria tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(registros) || registros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">No hay registros de auditoría.</td></tr>';
      return;
    }

    registros.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(r.created_at).toLocaleString('es-BO')}</td>
        <td>${r.usuario}</td>
        <td>${r.accion}</td>
        <td>${r.detalles || '---'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error cargando auditoría:", error);
  }
}

// ==================== NOTIFICACIONES HISTORIAL ====================
async function cargarNotificacionesHistorial() {
  const inicio = document.getElementById('notifInicio').value;
  const fin = document.getElementById('notifFin').value;
  if (!inicio || !fin) { alert('Seleccione fechas.'); return; }

  try {
    const inicioISO = inicio + ':00';
    const finISO = fin + ':00';
    const url = `${BACKEND_URL}/api/fallas?inicio=${inicioISO}&fin=${finISO}`;
    const resp = await fetch(url);
    const fallas = await resp.json();

    const tbody = document.querySelector('#tablaNotificaciones tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(fallas) || fallas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No hay notificaciones.</td></tr>';
      return;
    }

    fallas.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(f.inicio).toLocaleString('es-BO')}</td>
        <td>${new Date(f.fin).toLocaleString('es-BO')}</td>
        <td>${f.tipo}</td>
        <td>${f.detalle}</td>
        <td>${f.duracion ? Math.round(f.duracion/60) + ' min' : '---'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error cargando notificaciones:", error);
  }
}

async function borrarNotificaciones() {
  const inicio = document.getElementById('notifInicio').value;
  const fin = document.getElementById('notifFin').value;
  if (!inicio || !fin) { alert('Seleccione fechas.'); return; }
  if (!confirm('¿Borrar las notificaciones del rango seleccionado?')) return;

  const inicioISO = inicio + ':00';
  const finISO = fin + ':00';
  await fetch(`${BACKEND_URL}/api/fallas/borrar?inicio=${inicioISO}&fin=${finISO}`, { method: 'DELETE' });
  alert('✅ Notificaciones borradas.');
  cargarNotificacionesHistorial();
}

let modoSimulacionActivo = false;

async function toggleModoSimulacion() {
  modoSimulacionActivo = !modoSimulacionActivo;
  const boton = document.getElementById('btnModoSimulacion');
  const botonesSim = document.getElementById('botonesSimulacion');

  if (modoSimulacionActivo) {
    if (!confirm('¿Activar Modo Simulación? Los sensores dejarán de leerse.')) {
      modoSimulacionActivo = false;
      return;
    }
    await enviarComando('modo_simulacro');
    boton.innerText = '⏸️ Desactivar Modo Simulación';
    boton.classList.add('btn-desactivar');
    botonesSim.style.display = 'flex';
    document.getElementById('bannerModoPruebas').classList.remove('hidden');
  } else {
    await enviarComando('modo_normal');
    boton.innerText = '🎭 Activar Modo Simulación';
    boton.classList.remove('btn-desactivar');
    botonesSim.style.display = 'none';
    document.getElementById('bannerModoPruebas').classList.add('hidden');
  }
}

async function cargarConfigNotificaciones() {
  try {
    const resp = await fetch(BACKEND_URL + '/api/configuracion');
    const config = await resp.json();
    const c = {};
    config.forEach(item => { c[item.clave] = item.valor; });
    
    document.getElementById('notifActivas').checked = c.notificaciones_activas === 'true';
    document.getElementById('notifApiKey').value = c.messenger_apikey || '';
  } catch (error) {
    console.error("Error cargando config:", error);
  }
}

async function guardarConfigNotificaciones() {
  const activas = document.getElementById('notifActivas').checked;
  const apiKey = document.getElementById('notifApiKey').value.trim(); // <-- .trim() elimina espacios

  if (!apiKey) {
    alert('⚠️ Ingrese una API Key válida.');
    return;
  }

  await fetch(BACKEND_URL + '/api/configuracion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      notificaciones_activas: activas ? 'true' : 'false',
      messenger_apikey: apiKey
    })
  });
  alert('✅ Configuración guardada.');
}

async function probarNotificacion() {
  await fetch(BACKEND_URL + '/api/notificaciones/probar', { method: 'POST' });
  alert('✅ Notificación de prueba enviada.');
}
