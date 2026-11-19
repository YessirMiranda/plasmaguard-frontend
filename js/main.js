// ==================== CONFIGURACIÓN ====================
const MAX_INTENTOS_PASSWORD = 3;
const TIEMPOS_BLOQUEO = [10000, 60000, 300000]; // 10s, 1min, 5min

// ==================== MENÚ DESPLEGABLE ====================
function toggleMenu(elemento) {
  document.querySelectorAll('.menu-item').forEach(item => {
    if (item !== elemento) item.classList.remove('active');
  });
  elemento.classList.toggle('active');
}

// ==================== GESTIÓN DE INTENTOS Y BLOQUEO ====================
function obtenerEstadoBloqueo() {
  const datos = localStorage.getItem('plasmaguard_bloqueo');
  if (!datos) return { intentos: 0, nivelBloqueo: 0, timestamp: 0 };
  return JSON.parse(datos);
}

function guardarEstadoBloqueo(estado) {
  localStorage.setItem('plasmaguard_bloqueo', JSON.stringify(estado));
}

function limpiarEstadoBloqueo() {
  localStorage.removeItem('plasmaguard_bloqueo');
}

function verificarBloqueoActivo() {
  const estado = obtenerEstadoBloqueo();
  if (estado.nivelBloqueo > 0 && estado.timestamp > 0) {
    const tiempoTranscurrido = Date.now() - estado.timestamp;
    const tiempoBloqueo = TIEMPOS_BLOQUEO[Math.min(estado.nivelBloqueo - 1, TIEMPOS_BLOQUEO.length - 1)];
    if (tiempoTranscurrido < tiempoBloqueo) {
      const restante = Math.ceil((tiempoBloqueo - tiempoTranscurrido) / 1000);
      return { activo: true, restante: restante };
    } else {
      estado.timestamp = 0;
      guardarEstadoBloqueo(estado);
      return { activo: false, restante: 0 };
    }
  }
  return { activo: false, restante: 0 };
}

function iniciarTimerBloqueo() {
  const timerDiv = document.getElementById('timerBloqueo');
  const btnIngresar = document.getElementById('btnIngresar');
  const intervalo = setInterval(() => {
    const bloqueo = verificarBloqueoActivo();
    if (bloqueo.activo) {
      timerDiv.innerText = `⏳ Bloqueado. Intente en ${bloqueo.restante} segundos.`;
      btnIngresar.disabled = true;
    } else {
      clearInterval(intervalo);
      timerDiv.innerText = '';
      btnIngresar.disabled = false;
    }
  }, 1000);
}

// ==================== VALIDACIÓN DE LOGIN ====================
async function validarLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();
  const mensaje = document.getElementById('mensajeError');

  // Verificar bloqueo local
  const bloqueo = verificarBloqueoActivo();
  if (bloqueo.activo) {
    mensaje.style.color = '#ffaa00';
    mensaje.innerText = `⏳ Demasiados intentos. Espere ${bloqueo.restante} segundos.`;
    return false;
  }

  try {
    const respuesta = await fetch('https://plasmaguard-backend.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });

    const data = await respuesta.json();

    // Login fallido
    if (!respuesta.ok) {
      let estado = obtenerEstadoBloqueo();
      estado.intentos++;

      if (estado.intentos >= MAX_INTENTOS_PASSWORD) {
        estado.nivelBloqueo++;
        estado.timestamp = Date.now();
        estado.intentos = 0;
        guardarEstadoBloqueo(estado);
        mensaje.style.color = '#ff6b6b';
        mensaje.innerText = '🚫 Demasiados intentos. Cuenta bloqueada temporalmente.';
        iniciarTimerBloqueo();
        document.getElementById('password').value = '';
        return false;
      } else {
        guardarEstadoBloqueo(estado);
        mensaje.style.color = '#ffaa00';
        mensaje.innerText = `⚠️ ${data.error || 'Usuario o contraseña incorrectos'}. Intento ${estado.intentos}/${MAX_INTENTOS_PASSWORD}.`;
        document.getElementById('password').value = '';
        return false;
      }
    }

    // Login exitoso
    limpiarEstadoBloqueo();
    mensaje.style.color = '#4db8ff';
    mensaje.innerText = '✅ Bienvenido, ' + data.nombre + '. Redirigiendo...';

    sessionStorage.setItem('plasmaguard_sesion', JSON.stringify({
      usuario: data.usuario,
      nombre: data.nombre,
      rol: data.rol,
      institucion: data.institucion || 'potosi'
    }));

    setTimeout(() => {
      if (data.rol === 'operador') {
        window.location.href = 'operador.html';
      } else if (data.rol === 'tecnico') {
        sessionStorage.setItem('tecnico_pendiente', data.usuario);
        window.location.href = 'verificacion_tecnico.html';
      } else if (data.rol === 'admin') {
        sessionStorage.setItem('admin_pendiente', data.usuario);
        window.location.href = 'verificacion_admin.html';
      } else {
        mensaje.style.color = '#ff6b6b';
        mensaje.innerText = '❌ Rol no reconocido. Contacte al administrador.';
      }
    }, 1000);

    return false;
  } catch (error) {
    console.error("Error en login:", error);
    mensaje.style.color = '#ff6b6b';
    mensaje.innerText = '❌ Error de conexión. Revise la consola.';
    return false;
  }
}

// ==================== NAVEGACIÓN ====================
function irACrearCuenta() {
  window.location.href = 'crear_cuenta.html';
}

function irAOlvidoContrasena() {
  window.location.href = 'olvido_contrasena.html';
}

// ==================== INICIALIZACIÓN ====================
window.addEventListener('load', () => {
  const bloqueo = verificarBloqueoActivo();
  if (bloqueo.activo) {
    iniciarTimerBloqueo();
  }
});
