// ==================== CONSTANTES ====================
const CLAVE_TECNICO = "TECNICO2026";
const MAX_INTENTOS_TECNICO = 3;
let intentosTecnico = 0;

// ==================== MOSTRAR CAMPO TÉCNICO ====================
function mostrarCampoTecnico() {
  const tipo = document.getElementById('tipoUsuario').value;
  const campo = document.getElementById('campoTecnico');
  if (tipo === 'tecnico') {
    campo.classList.remove('hidden');
  } else {
    campo.classList.add('hidden');
    document.getElementById('codigoTecnico').value = '';
    document.getElementById('errorCodigoTecnico').innerText = '';
    intentosTecnico = 0;
  }
}

// ==================== VALIDACIONES ====================
function validarNombre(valor) {
  // Solo letras, primera mayúscula, resto minúscula, máx 30
  if (!/^[A-Z][a-záéíóúñ]*$/.test(valor)) return false;
  if (valor.length > 30) return false;
  return true;
}

function validarFecha(fechaStr) {
  // Acepta formato YYYY-MM-DD
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return false;
  
  const hoy = new Date();
  const edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
    if (edad - 1 < 18) return false;
  } else {
    if (edad < 18) return false;
  }
  return true;
}

function validarFechaManual(fechaStr) {
  // Formato esperado: DD/MM/AAAA
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = fechaStr.match(regex);
  if (!match) return false;

  const dia = parseInt(match[1]);
  const mes = parseInt(match[2]) - 1; // Mes 0-indexado
  const anio = parseInt(match[3]);

  const fecha = new Date(anio, mes, dia);
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes || fecha.getFullYear() !== anio) {
    return false; // Fecha inválida (ej: 31/02/2000)
  }

  // Verificar mayoría de edad
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();

  if (mesActual < mes || (mesActual === mes && diaActual < dia)) {
    edad--;
  }

  return edad >= 18;
}
// ==================== VALIDACIÓN DEL FORMULARIO ====================
function validarFormulario(event) {
  event.preventDefault();
  let valido = true;

  // Limpiar errores
  document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
  document.getElementById('mensajeGeneral').innerText = '';

  // Nombre
  const nombre = document.getElementById('nombre').value.trim();
  if (!validarNombre(nombre)) {
    document.getElementById('errorNombre').innerText = 'Primera mayúscula, resto minúscula, solo letras (máx 30).';
    valido = false;
  }

  // Apellido Paterno
  const apPaterno = document.getElementById('apellidoPaterno').value.trim();
  if (!validarNombre(apPaterno)) {
    document.getElementById('errorApellidoPaterno').innerText = 'Primera mayúscula, resto minúscula, solo letras (máx 30).';
    valido = false;
  }

  // Apellido Materno
  const apMaterno = document.getElementById('apellidoMaterno').value.trim();
  if (!validarNombre(apMaterno)) {
    document.getElementById('errorApellidoMaterno').innerText = 'Primera mayúscula, resto minúscula, solo letras (máx 30).';
    valido = false;
  }

  // Fecha de Nacimiento
  const fechaInput = document.getElementById('fechaNacimiento').value.trim();
  if (!validarFechaManual(fechaInput)) {
    document.getElementById('errorFecha').innerText = 'Formato DD/MM/AAAA. Debe ser mayor de 18 años.';
    valido = false;
  }

  // CI
  const ci = document.getElementById('ci').value.trim();
  if (!validarCI(ci)) {
    document.getElementById('errorCI').innerText = 'Solo números y guiones (máx 12).';
    valido = false;
  }

  // Password
  const password = document.getElementById('password').value;
  if (!validarPassword(password)) {
    document.getElementById('errorPassword').innerText = 'Máx 10, con mayúscula, minúscula, número y especial.';
    valido = false;
  }

  // Confirmar Password
  const confirmar = document.getElementById('confirmarPassword').value;
  if (password !== confirmar) {
    document.getElementById('errorConfirmar').innerText = 'Las contraseñas no coinciden.';
    valido = false;
  }

  // Tipo de Usuario
  const tipo = document.getElementById('tipoUsuario').value;
  if (!tipo) {
    document.getElementById('errorTipo').innerText = 'Seleccione un tipo.';
    valido = false;
  }

  // Código Técnico
  if (tipo === 'tecnico') {
    const codigo = document.getElementById('codigoTecnico').value.trim();
    if (codigo !== CLAVE_TECNICO) {
      intentosTecnico++;
      if (intentosTecnico >= MAX_INTENTOS_TECNICO) {
        alert('🚫 Personal no autorizado. Será redirigido al inicio.');
        window.location.href = 'index.html';
        return false;
      } else {
        document.getElementById('errorCodigoTecnico').innerText = `Código incorrecto. Intento ${intentosTecnico}/${MAX_INTENTOS_TECNICO}.`;
        valido = false;
      }
    } else {
      intentosTecnico = 0;
    }
  }

  // Institución
  if (!document.getElementById('institucion').value) {
    document.getElementById('errorInstitucion').innerText = 'Seleccione una institución.';
    valido = false;
  }

  // Celular
  const celular = document.getElementById('celular').value.trim();
  if (!validarCelular(celular)) {
    document.getElementById('errorCelular').innerText = 'Solo números (máx 10).';
    valido = false;
  }

  // Dirección
  const direccion = document.getElementById('direccion').value.trim();
  if (direccion.length > 50) {
    document.getElementById('errorDireccion').innerText = 'Máximo 50 caracteres.';
    valido = false;
  }

  // Correo
  const correo = document.getElementById('correo').value.trim();
  if (!validarCorreo(correo)) {
    document.getElementById('errorCorreo').innerText = 'Debe ser un correo válido (Gmail, Hotmail, etc).';
    valido = false;
  }

  // Si todo es válido
  if (valido) {
    document.getElementById('mensajeGeneral').style.color = '#4db8ff';
    document.getElementById('mensajeGeneral').innerText = '✅ Usuario creado con éxito. Redirigiendo al inicio...';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  } else {
    document.getElementById('mensajeGeneral').style.color = '#ff6b6b';
    document.getElementById('mensajeGeneral').innerText = '❌ Corrija los errores antes de continuar.';
  }

  return false;
}

// ==================== VOLVER AL INICIO ====================
function volverAlInicio() {
  window.location.href = 'index.html';
}

