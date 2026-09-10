// ==================== CONFIGURACIÓN ====================
const MAX_INTENTOS_PASSWORD = 3;
const TIEMPOS_BLOQUEO = [10000, 60000, 300000]; // 10s, 1min, 5min
const CLAVE_TECNICO = "TECNICO2026"; // Código fijo para técnicos (luego se valida en backend)

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
  if (!datos) {
    return { intentos: 0, nivelBloqueo: 0, timestamp: 0 };
  }
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
      // El bloqueo expiró, pero mantenemos el nivel para el próximo fallo
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
function validarLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();
  const mensaje = document.getElementById('mensajeError');

  // Verificar si hay bloqueo activo
  const bloqueo = verificarBloqueoActivo();
  if (bloqueo.activo) {
    mensaje.style.color = '#ffaa00';
    mensaje.innerText = `⏳ Demasiados intentos. Espere ${bloqueo.restante} segundos.`;
    return false;
  }

  // Usuarios simulados
  const usuariosValidos = [
    { user: '1234567', pass: 'Operador1!', rol: 'operador', nombre: 'Juan Pérez', institucion: 'Banco de Sangre de Referencia Departamental de Potosí' },
    { user: '7654321', pass: 'Tecnico1!', rol: 'tecnico', nombre: 'María López', institucion: 'Banco de Sangre de Referencia Departamental de Potosí' },
    { user: '10509091', pass: 'KiriKiri@1230', rol: 'admin', nombre: 'Yessir Miranda', institucion: 'Banco de Sangre de Referencia Departamental de Potosí' }
  ];

  // Buscar si el usuario existe
  const usuarioEncontrado = usuariosValidos.find(u => u.user === usuario);

  if (!usuarioEncontrado) {
    // Usuario NO existe
    mensaje.style.color = '#ff6b6b';
    mensaje.innerText = '❌ El usuario ingresado no existe.';
    setTimeout(() => {
      document.getElementById('usuario').value = '';
      document.getElementById('password').value = '';
      mensaje.innerText = '';
    }, 2000);
    return false;
  }

  // Usuario existe, verificar contraseña
  if (usuarioEncontrado.pass !== password) {
    // Contraseña incorrecta
    let estado = obtenerEstadoBloqueo();
    estado.intentos++;
    
    if (estado.intentos >= MAX_INTENTOS_PASSWORD) {
      // Activar bloqueo
      estado.nivelBloqueo++;
      estado.timestamp = Date.now();
      estado.intentos = 0;
      guardarEstadoBloqueo(estado);
      
      mensaje.style.color = '#ff6b6b';
      mensaje.innerText = '🚫 No intente ingresar como usuario si no pertenece al personal del banco de sangre.';
      
      iniciarTimerBloqueo();
      document.getElementById('password').value = '';
      return false;
    } else {
      guardarEstadoBloqueo(estado);
      mensaje.style.color = '#ffaa00';
      mensaje.innerText = `⚠️ Usuario encontrado, contraseña incorrecta. Intento ${estado.intentos}/${MAX_INTENTOS_PASSWORD}.`;
      document.getElementById('password').value = '';
      return false;
    }
  }

    // Login exitoso
    limpiarEstadoBloqueo();
    mensaje.style.color = '#4db8ff';
    mensaje.innerText = '✅ Bienvenido, ' + usuarioEncontrado.nombre + '. Redirigiendo...';

    // Guardar sesión
    sessionStorage.setItem('plasmaguard_sesion', JSON.stringify({
      usuario: usuarioEncontrado.user,
      nombre: usuarioEncontrado.nombre,
      rol: usuarioEncontrado.rol,
      institucion: usuarioEncontrado.institucion || 'Banco de Sangre de Referencia Departamental de Potosí'
    }));

    // Redirigir según el rol
    setTimeout(() => {
      if (usuarioEncontrado.rol === 'operador') {
        window.location.href = 'operador.html';
      } else if (usuarioEncontrado.rol === 'tecnico') {
        sessionStorage.setItem('tecnico_pendiente', usuarioEncontrado.user);
        window.location.href = 'verificacion_tecnico.html';
      } else if (usuarioEncontrado.rol === 'admin') {
        window.location.href = 'admin.html';
      }
    }, 1000);

    return false;
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
