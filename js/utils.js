// ==================== TOGGLE PASSWORD (OJO DE VISIBILIDAD) ====================
function togglePassword(inputId, icono) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    icono.innerText = '🙈';
  } else {
    input.type = 'password';
    icono.innerText = '👁️';
  }
}

// ==================== FORMATEO DE FECHAS EN HORA DE BOLIVIA ====================
// CAMBIO: nueva función reutilizable para mostrar fechas en hora de Bolivia
// Resuelve el desfase de 4 horas (UTC -> America/La_Paz)
function formatearFechaBolivia(fechaISO) {
  if (!fechaISO) return '---';
  try {
    return new Date(fechaISO).toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
  } catch (e) {
    return new Date(fechaISO).toLocaleString('es-BO');
  }
}

function formatearFechaCortaBolivia(fechaISO) {
  if (!fechaISO) return '---';
  try {
    const d = new Date(fechaISO);
    const fecha = d.toLocaleDateString('es-BO', { timeZone: 'America/La_Paz' });
    const hora = d.toLocaleTimeString('es-BO', { timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit' });
    return `${fecha} ${hora}`;
  } catch (e) {
    return new Date(fechaISO).toLocaleString('es-BO');
  }
}

// CAMBIO: nueva función para el PDF (fecha/hora en formato largo)
function formatearFechaPDFBolivia(fechaISO) {
  if (!fechaISO) return '---';
  const d = new Date(fechaISO);
  const partes = d.toLocaleString('es-BO', { timeZone: 'America/La_Paz' }).split(' ');
  // "19/11/2026 14:30:00" -> "19/11/2026 14:30"
  return partes[0] + ' ' + (partes[1] || '').substring(0, 5);
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
