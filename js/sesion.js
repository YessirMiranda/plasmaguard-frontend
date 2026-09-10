// ==================== PROTECCIÓN DE SESIÓN ====================
function verificarSesion(rolRequerido) {
  const sesion = sessionStorage.getItem('plasmaguard_sesion');
  if (!sesion) {
    alert('⚠️ Debe iniciar sesión para acceder a esta ventana.');
    window.location.href = 'index.html';
    return null;
  }

  const datos = JSON.parse(sesion);
  if (rolRequerido && datos.rol !== rolRequerido) {
    alert('🚫 No tiene permiso para acceder a esta ventana.');
    window.location.href = 'index.html';
    return null;
  }

  return datos;
}

// ==================== CERRAR SESIÓN ====================
function cerrarSesion() {
  sessionStorage.removeItem('plasmaguard_sesion');
  sessionStorage.removeItem('tecnico_pendiente');
  window.location.href = 'index.html';
}

// ==================== OBTENER DATOS DE SESIÓN ====================
function obtenerSesion() {
  const sesion = sessionStorage.getItem('plasmaguard_sesion');
  return sesion ? JSON.parse(sesion) : null;
}
