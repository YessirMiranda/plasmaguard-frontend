// ==================== MENÚ DESPLEGABLE ====================
function toggleMenu(elemento) {
  // Cerrar otros menús abiertos
  document.querySelectorAll('.menu-item').forEach(item => {
    if (item !== elemento) item.classList.remove('active');
  });
  elemento.classList.toggle('active');
}

// ==================== VALIDACIÓN DE LOGIN (Simulada) ====================
function validarLogin(event) {
  event.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();
  const mensaje = document.getElementById('mensajeError');

  // Usuarios simulados (luego se conectará a Supabase Auth)
  const usuariosValidos = [
    { user: 'operador', pass: 'operador123', rol: 'operador' },
    { user: 'tecnico', pass: 'tecnico123', rol: 'tecnico' },
    { user: 'admin', pass: 'admin123', rol: 'admin' }
  ];

  const encontrado = usuariosValidos.find(u => u.user === usuario && u.pass === password);

  if (encontrado) {
    mensaje.style.color = '#4db8ff';
    mensaje.innerText = '✅ Bienvenido, ' + usuario + '. Redirigiendo...';
    
    // Redirigir según el rol (por ahora, solo un mensaje)
    setTimeout(() => {
      alert('Ingresaste como: ' + encontrado.rol.toUpperCase());
      // Aquí se redirigirá a la ventana correspondiente:
      // if (encontrado.rol === 'operador') window.location.href = 'operador.html';
      // if (encontrado.rol === 'tecnico') window.location.href = 'tecnico.html';
      // if (encontrado.rol === 'admin') window.location.href = 'admin.html';
    }, 1000);
  } else {
    mensaje.style.color = '#ff6b6b';
    mensaje.innerText = '❌ Usuario o contraseña incorrectos.';
  }

  return false;
}

// ==================== CREAR CUENTA ====================
function crearCuenta() {
  alert('Función de creación de cuenta en desarrollo.\nPronto se conectará a Supabase Auth.');
}
