// ==================== TOGGLE PASSWORD (OJO DE VISIBILIDAD) ====================
function togglePassword(inputId, icono) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    icono.innerText = '🙈'; // Mono tapándose los ojos (ocultar)
  } else {
    input.type = 'password';
    icono.innerText = '👁️'; // Ojo (mostrar)
  }
}

// ==================== VALIDACIONES REUTILIZABLES ====================
function validarPassword(valor) {
  if (valor.length > 10) return false;
  if (!/[A-Z]/.test(valor)) return false;
  if (!/[a-z]/.test(valor)) return false;
  if (!/[0-9]/.test(valor)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(valor)) return false;
  return true;
}

function validarCorreo(valor) {
  const dominios = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];
  if (!dominios.some(d => valor.endsWith(d))) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return false;
  return true;
}

function validarCI(valor) {
  if (!/^[0-9-]+$/.test(valor)) return false;
  if (valor.length > 12) return false;
  return true;
}

function validarCelular(valor) {
  if (!/^[0-9]{1,10}$/.test(valor)) return false;
  return true;
}
