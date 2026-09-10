// ==================== VARIABLES ====================
const MAX_INTENTOS_CODIGO = 3;
let intentosCodigo = 0;
let codigoGenerado = '';
let usuarioValido = '';
let correoValido = '';

// Usuarios simulados (mismos de la Ventana 1)
const usuariosValidos = [
  { user: '1234567', correo: 'juan@gmail.com', nombre: 'Juan Pérez' },
  { user: '7654321', correo: 'maria@hotmail.com', nombre: 'María López' },
  { user: '1111111', correo: 'yessir@gmail.com', nombre: 'Yessir Miranda' }
];

// ==================== ENVIAR CÓDIGO ====================
function enviarCodigo() {
  const usuario = document.getElementById('usuarioOlvido').value.trim();
  const correo = document.getElementById('correoOlvido').value.trim();
  const mensaje = document.getElementById('mensajeGeneral');

  // Limpiar errores
  document.getElementById('errorUsuarioOlvido').innerText = '';
  document.getElementById('errorCorreoOlvido').innerText = '';

  // Validar campos
  if (!usuario) {
    document.getElementById('errorUsuarioOlvido').innerText = 'Ingrese su usuario.';
    return;
  }
  if (!correo) {
    document.getElementById('errorCorreoOlvido').innerText = 'Ingrese su correo.';
    return;
  }

  // Buscar usuario
  const encontrado = usuariosValidos.find(u => u.user === usuario);
  if (!encontrado) {
    document.getElementById('errorUsuarioOlvido').innerText = 'Usuario no encontrado.';
    return;
  }

  // Verificar que el correo coincida
  if (encontrado.correo.toLowerCase() !== correo.toLowerCase()) {
    document.getElementById('errorCorreoOlvido').innerText = 'El correo no coincide con el registrado.';
    return;
  }

  // Generar código de 6 dígitos
  codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
  usuarioValido = usuario;
  correoValido = correo;

  // Simular envío de correo (mostrar en consola/pantalla)
  console.log(`📧 Código enviado a ${correo}: ${codigoGenerado}`);
  
  // Mostrar mensaje simulado
  mensaje.style.color = '#4db8ff';
  mensaje.innerText = `✅ Código enviado a ${correo} (Simulado: ${codigoGenerado})`;

  // Mostrar campo de código y botón de verificar
  document.getElementById('campoCodigo').classList.remove('hidden');
  document.getElementById('btnVerificar').classList.remove('hidden');
  document.querySelector('.btn-enviar-codigo').disabled = true;
}

// ==================== VERIFICAR CÓDIGO ====================
function verificarCodigo() {
  const codigo = document.getElementById('codigoVerificacion').value.trim();
  const mensaje = document.getElementById('mensajeGeneral');

  if (!codigo) {
    document.getElementById('errorCodigo').innerText = 'Ingrese el código.';
    return;
  }

  if (codigo === codigoGenerado) {
    // Código correcto
    mensaje.style.color = '#4db8ff';
    mensaje.innerText = '✅ Código verificado. Redirigiendo...';
    
    // Guardar en sessionStorage el usuario para la Ventana 4
    sessionStorage.setItem('usuarioRecuperacion', usuarioValido);
    
    setTimeout(() => {
      window.location.href = 'cambio_contrasena.html';
    }, 1500);
  } else {
    // Código incorrecto
    intentosCodigo++;
    if (intentosCodigo >= MAX_INTENTOS_CODIGO) {
      alert('🚫 Demasiados intentos fallidos. Será redirigido al inicio.');
      window.location.href = 'index.html';
    } else {
      document.getElementById('errorCodigo').innerText = `Código incorrecto. Intento ${intentosCodigo}/${MAX_INTENTOS_CODIGO}.`;
    }
  }
}

// ==================== VOLVER AL INICIO ====================
function volverAlInicio() {
  window.location.href = 'index.html';
}

// ==================== VALIDACIÓN DEL FORMULARIO ====================
function validarOlvido(event) {
  event.preventDefault();
  // La validación se maneja en los botones
  return false;
}
