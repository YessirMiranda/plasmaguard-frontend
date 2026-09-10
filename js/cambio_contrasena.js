// ==================== VALIDACIÓN ====================
function validarPassword(valor) {
  // Máx 10, al menos 1 mayúscula, 1 minúscula, 1 número, 1 especial
  if (valor.length > 10) return false;
  if (!/[A-Z]/.test(valor)) return false;
  if (!/[a-z]/.test(valor)) return false;
  if (!/[0-9]/.test(valor)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(valor)) return false;
  return true;
}

// ==================== VALIDAR CAMBIO ====================
function validarCambio(event) {
  event.preventDefault();
  const nueva = document.getElementById('nuevaPassword').value;
  const confirmar = document.getElementById('confirmarNueva').value;
  const mensaje = document.getElementById('mensajeGeneral');

  document.getElementById('errorNueva').innerText = '';
  document.getElementById('errorConfirmar').innerText = '';

  if (!validarPassword(nueva)) {
    document.getElementById('errorNueva').innerText = 'Máx 10, con mayúscula, minúscula, número y especial.';
    return false;
  }

  if (nueva !== confirmar) {
    document.getElementById('errorConfirmar').innerText = 'Las contraseñas no coinciden.';
    return false;
  }

  // Simular guardado en la base de datos
  const usuario = sessionStorage.getItem('usuarioRecuperacion');
  console.log(`🔐 Contraseña actualizada para el usuario: ${usuario}`);
  
  mensaje.style.color = '#4db8ff';
  mensaje.innerText = '✅ Contraseña actualizada con éxito. Redirigiendo al inicio...';

  setTimeout(() => {
    sessionStorage.removeItem('usuarioRecuperacion');
    window.location.href = 'index.html';
  }, 2000);

  return false;
}

// ==================== VOLVER ====================
function volverAlInicio() {
  window.location.href = 'index.html';
}
