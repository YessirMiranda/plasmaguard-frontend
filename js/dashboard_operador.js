// ==================== CONFIGURACIÓN ====================
const BACKEND_URL = "https://plasmaguard-backend.onrender.com";
let graficaTemperaturas = null;

// ==================== VERIFICAR SESIÓN ====================
const sesion = verificarSesion('operador');

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (sesion) {
      document.getElementById('bienvenida').innerText = `Bienvenido, ${sesion.nombre} (Operador)`;
    }
    
    cargarDatos();
    setInterval(cargarDatos, 10000);
    
    cargarNotificaciones();
    setInterval(cargarNotificaciones, 30000);
  } catch (error) {
    console.error("Error en inicialización:", error);
  }
});

// ==================== CAMBIO DE PESTAÑAS ====================
function cambiarTab(nombreTab, boton) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById('tab-' + nombreTab).classList.add('active');
  boton.classList.add('active');
}

// ==================== NOTIFICACIONES ====================
function toggleNotificaciones() {
  document.getElementById('panelNotificaciones').classList.toggle('hidden');
}

async function cargarNotificaciones() {
  const notificaciones = [];
  const contador = document.getElementById('contadorNotif');
  const lista = document.getElementById('listaNotificaciones');
  
  if (notificaciones.length > 0) {
    contador.innerText = notificaciones.length;
    lista.innerHTML = notificaciones.map(n => 
      `<div class="notificacion-item ${n.tipo}">${n.mensaje}</div>`
    ).join('');
  } else {
    contador.innerText = '0';
    lista.innerHTML = '<p class="sin-notificaciones">Sin notificaciones nuevas.</p>';
  }
}

// ==================== CARGA DE DATOS ====================
async function cargarDatos() {
  try {
    const respuesta = await fetch(BACKEND_URL + "/api/ultimo");
    const datos = await respuesta.json();
    
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
  
  document.getElementById('estadoAC').innerText = d.estado_ac ? '✅ Conectada' : '❌ Apagón';
  document.getElementById('cardAC').className = 'card ' + (d.estado_ac ? 'ok' : 'alerta');
  
  document.getElementById('estadoRouter').innerText = d.router_activo ? '✅ Alimentado' : '❌ Cortado';
  document.getElementById('cardRouter').className = 'card ' + (d.router_activo ? 'ok' : 'alerta');
  
  document.getElementById('estadoInternet').innerText = d.internet_activo ? '✅ Conectado' : '❌ Sin conexión';
  document.getElementById('cardInternet').className = 'card ' + (d.internet_activo ? 'ok' : 'alerta');
  
  const bateriaOk = d.voltaje_bateria > 11.0;
  document.getElementById('estadoBateria').innerText = bateriaOk ? '✅ En buen estado' : '⚠️ Baja';
  document.getElementById('cardBateria').className = 'card ' + (bateriaOk ? 'ok' : 'alerta');
  
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
    let advertencias = [];
    if (!datos.estado_ac) advertencias.push('Sin energía eléctrica');
    if (!datos.router_activo) advertencias.push('Router cortado');
    if (!datos.internet_activo) advertencias.push('Sin conexión a internet');
    if (datos.voltaje_bateria <= 11.0) advertencias.push('Batería baja');
    if (!datos.sd_detectada) advertencias.push('MicroSD no detectada');
    mensaje.innerText = 'Advertencia: ' + advertencias.join(', ') + '.';
  } else {
    banner.className = 'banner-estado ok';
    icono.innerText = '✅';
    mensaje.innerText = 'Sistema operando con normalidad.';
  }
}

// ==================== FALLAS ====================
async function cargarFallas() {
  const inicio = document.getElementById('fallasInicio').value;
  const fin = document.getElementById('fallasFin').value;

  if (!inicio || !fin) {
    alert('Seleccione fecha y hora de inicio y fin.');
    return;
  }

  try {
    const inicioISO = inicio + ':00';
    const finISO = fin + ':00';

    const url = `${BACKEND_URL}/api/fallas?inicio=${inicioISO}&fin=${finISO}`;
    console.log("Consultando fallas:", url);

    const respuesta = await fetch(url);
    const fallas = await respuesta.json();
    console.log("Fallas recibidas:", fallas);

    const tbody = document.querySelector('#tablaFallas tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(fallas) || fallas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No hay fallas en este período.</td></tr>';
      return;
    }

    fallas.forEach(f => {
      const tr = document.createElement('tr');
      const inicioStr = new Date(f.inicio).toLocaleString('es-BO');
      const finStr = new Date(f.fin).toLocaleString('es-BO');
      const duracion = f.duracion ? `${Math.round(f.duracion / 60)} min` : '---';

      tr.innerHTML = `
        <td>${inicioStr}</td>
        <td>${finStr}</td>
        <td>${f.tipo}</td>
        <td>${f.detalle}</td>
        <td>${duracion}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error cargando fallas:", error);
    alert('Error al cargar las fallas. Revise la consola.');
  }
}

// ==================== TEMPERATURAS ====================
async function cargarTemperaturas() {
  const inicio = document.getElementById('tempInicio').value;
  const fin = document.getElementById('tempFin').value;
  const intervalo = document.getElementById('tempIntervalo').value;
  const incluirFallas = document.getElementById('incluirFallas').checked;

  console.log("Filtros:", { inicio, fin, intervalo, incluirFallas });

  if (!inicio || !fin) {
    alert('Seleccione fecha y hora de inicio y fin.');
    return;
  }

  try {
    const inicioISO = inicio + ':00';
    const finISO = fin + ':00';

    const url = `${BACKEND_URL}/api/temperaturas?inicio=${inicioISO}&fin=${finISO}&intervalo=${intervalo}`;
    console.log("Consultando:", url);

    const respuesta = await fetch(url);
    console.log("Respuesta HTTP:", respuesta.status);

    const datos = await respuesta.json();
    console.log("Datos recibidos:", datos);

    if (!Array.isArray(datos) || datos.length === 0) {
      document.querySelector('#tablaTemperaturas tbody').innerHTML = 
        '<tr><td colspan="4">No hay datos en este período.</td></tr>';
      return;
    }

    let fallas = [];
    if (incluirFallas) {
      const urlFallas = `${BACKEND_URL}/api/fallas?inicio=${inicioISO}&fin=${finISO}`;
      const respFallas = await fetch(urlFallas);
      fallas = await respFallas.json();
      console.log("Fallas recibidas:", fallas);
    }

    mostrarTablaTemperaturas(datos, fallas);
    mostrarGraficaTemperaturas(datos);

  } catch (error) {
    console.error("Error cargando temperaturas:", error);
    alert('Error al cargar los datos. Revise la consola.');
  }
}

function mostrarTablaTemperaturas(datos, fallas) {
  const tbody = document.querySelector('#tablaTemperaturas tbody');
  tbody.innerHTML = '';

  let eventos = [];

  datos.forEach(d => {
    eventos.push({
      fecha: new Date(d.created_at),
      tipo: 'dato',
      s1: d.sensor_1,
      s2: d.sensor_2,
      s3: d.sensor_3
    });
  });

  fallas.forEach(f => {
    eventos.push({
      fecha: new Date(f.inicio),
      tipo: 'falla',
      falla: f
    });
  });

  eventos.sort((a, b) => a.fecha - b.fecha);

  eventos.forEach(e => {
    const tr = document.createElement('tr');

    if (e.tipo === 'dato') {
      const fechaStr = e.fecha.toLocaleString('es-BO');
      const s1 = (e.s1 === -127 || e.s1 === null) ? 'No conectado' : e.s1.toFixed(1) + ' °C';
      const s2 = (e.s2 === -127 || e.s2 === null) ? 'No conectado' : e.s2.toFixed(1) + ' °C';
      const s3 = (e.s3 === -127 || e.s3 === null) ? 'No conectado' : e.s3.toFixed(1) + ' °C';

      tr.innerHTML = `<td>${fechaStr}</td><td>${s1}</td><td>${s2}</td><td>${s3}</td>`;
    } else {
      const f = e.falla;
      const inicioStr = new Date(f.inicio).toLocaleString('es-BO');
      const finStr = new Date(f.fin).toLocaleString('es-BO');
      tr.className = 'fila-falla';
      tr.innerHTML = `<td>${inicioStr} - ${finStr}</td><td colspan="3">⚠️ Falla: ${f.detalle}</td>`;
    }

    tbody.appendChild(tr);
  });
}

function mostrarGraficaTemperaturas(datos) {
  const ctx = document.getElementById('graficaTemperaturas').getContext('2d');

  if (graficaTemperaturas) {
    graficaTemperaturas.destroy();
  }

  const etiquetas = datos.map(d => new Date(d.created_at).toLocaleString('es-BO'));
  const s1 = datos.map(d => (d.sensor_1 === -127 ? null : d.sensor_1));
  const s2 = datos.map(d => (d.sensor_2 === -127 ? null : d.sensor_2));
  const s3 = datos.map(d => (d.sensor_3 === -127 ? null : d.sensor_3));

  graficaTemperaturas = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: 'Sensor 1',
          data: s1,
          borderColor: '#4db8ff',
          backgroundColor: 'rgba(77, 184, 255, 0.1)',
          tension: 0.3,
          spanGaps: true
        },
        {
          label: 'Sensor 2',
          data: s2,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.3,
          spanGaps: true
        },
        {
          label: 'Sensor 3',
          data: s3,
          borderColor: '#ffd77d',
          backgroundColor: 'rgba(255, 215, 125, 0.1)',
          tension: 0.3,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#d0e5f5' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#a0d0f0', maxTicksLimit: 10 }
        },
        y: {
          ticks: { color: '#a0d0f0' }
        }
      }
    }
  });
}

// ==================== INFORMES ====================
async function generarInforme() {
  const inicio = document.getElementById('informeInicio').value;
  const fin = document.getElementById('informeFin').value;
  const intervalo = document.getElementById('informeIntervalo').value;
  const incluirFallas = document.getElementById('informeIncluirFallas').checked;

  if (!inicio || !fin) {
    alert('Seleccione fecha de inicio y fin.');
    return;
  }

  if (new Date(inicio) > new Date(fin)) {
    alert('La fecha de inicio no puede ser mayor a la fecha fin.');
    return;
  }

  try {
    // Mostrar mensaje de carga
    document.getElementById('vistaPreviaInforme').innerHTML = 
      '<p>Generando informe... ⏳</p>';

    // Calcular intervalo en segundos según la cantidad de datos por día
    const intervaloSegundos = Math.floor(86400 / parseInt(intervalo));

    // Consultar temperaturas
    const inicioISO = inicio + 'T00:00:00';
    const finISO = fin + 'T23:59:59';
    const url = `${BACKEND_URL}/api/temperaturas?inicio=${inicioISO}&fin=${finISO}&intervalo=${intervaloSegundos}`;
    const respTemp = await fetch(url);
    const datos = await respTemp.json();

    // Consultar fallas
    let fallas = [];
    if (incluirFallas) {
      const urlFallas = `${BACKEND_URL}/api/fallas?inicio=${inicioISO}&fin=${finISO}`;
      const respFallas = await fetch(urlFallas);
      fallas = await respFallas.json();
    }

    if (!Array.isArray(datos) || datos.length === 0) {
      alert('No hay datos en el período seleccionado.');
      document.getElementById('vistaPreviaInforme').innerHTML = 
        '<p>No hay datos en el período seleccionado.</p>';
      return;
    }

    // Generar PDF
    generarPDFInforme(datos, fallas, inicio, fin, intervalo);

  } catch (error) {
    console.error("Error generando informe:", error);
    alert('Error al generar el informe. Revise la consola.');
  }
}

function generarPDFInforme(datos, fallas, inicio, fin, intervalo) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('❌ Error: La librería jsPDF no está cargada.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const sesion = obtenerSesion();
  const nombreUsuario = sesion ? sesion.nombre : 'Usuario';
  const institucion = (sesion && sesion.institucion && sesion.institucion.trim() !== '') 
  ? sesion.institucion 
  : 'Banco de Sangre de Referencia Departamental de Potosí';

  // *** CONVERSIÓN SEGURA DE VALORES ***
  const inicioStr = (inicio === null || inicio === undefined) ? 'No especificado' : String(inicio);
  const finStr = (fin === null || fin === undefined) ? 'No especificado' : String(fin);
  const intervaloStr = (intervalo === null || intervalo === undefined) ? 'No especificado' : String(intervalo);

  // ==================== ENCABEZADO ====================
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('PLASMAGUARD', 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.text('Registro de Temperaturas', 105, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.text(String(institucion), 105, 32, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(77, 184, 255);
  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);

  // ==================== DATOS DEL INFORME ====================
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const hoy = new Date();
  const fechaEmision = `Potosí, ${hoy.getDate()} de ${obtenerMes(hoy.getMonth())} del ${hoy.getFullYear()}`;

  doc.text(`Fecha de emisión: ${fechaEmision}`, 15, 45);
  doc.text(`Hora de emisión: ${hoy.getHours()}:${String(hoy.getMinutes()).padStart(2, '0')}`, 15, 51);
  doc.text(`Período: ${inicioStr} al ${finStr}`, 15, 57);
  doc.text(`Datos por día: ${intervaloStr}`, 15, 63);
  doc.text(`Solicitado por: ${nombreUsuario}`, 15, 69);
  doc.text(`Institución: ${institucion}`, 15, 75);

  // ==================== TABLA DE TEMPERATURAS ====================
  let y = 85;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text('Datos de Temperatura', 15, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFillColor(77, 184, 255);
  doc.setTextColor(255, 255, 255);
  doc.rect(15, y, 180, 7, 'F');
  doc.text('Fecha/Hora', 18, y + 5);
  doc.text('Sensor 1', 70, y + 5);
  doc.text('Sensor 2', 105, y + 5);
  doc.text('Sensor 3', 140, y + 5);
  y += 7;

  doc.setTextColor(60, 60, 60);
  datos.forEach((d, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 0) {
      doc.setFillColor(240, 248, 255);
      doc.rect(15, y, 180, 6, 'F');
    }

    const fecha = new Date(d.created_at);
    const fechaStr = `${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()} ${String(fecha.getHours()).padStart(2,'0')}:${String(fecha.getMinutes()).padStart(2,'0')}`;
    
    const s1 = (d.sensor_1 === -127 || d.sensor_1 === null || d.sensor_1 === undefined) ? 'No conectado' : d.sensor_1.toFixed(1) + ' °C';
    const s2 = (d.sensor_2 === -127 || d.sensor_2 === null || d.sensor_2 === undefined) ? 'No conectado' : d.sensor_2.toFixed(1) + ' °C';
    const s3 = (d.sensor_3 === -127 || d.sensor_3 === null || d.sensor_3 === undefined) ? 'No conectado' : d.sensor_3.toFixed(1) + ' °C';

    doc.text(String(fechaStr), 18, y + 4);
    doc.text(String(s1), 70, y + 4);
    doc.text(String(s2), 105, y + 4);
    doc.text(String(s3), 140, y + 4);
    y += 6;
  });

  // ==================== TABLA DE FALLAS ====================
  if (fallas && fallas.length > 0) {
    y += 10;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text('Fallas Detectadas', 15, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFillColor(255, 68, 68);
    doc.setTextColor(255, 255, 255);
    doc.rect(15, y, 180, 7, 'F');
    doc.text('Inicio', 18, y + 5);
    doc.text('Fin', 60, y + 5);
    doc.text('Tipo', 100, y + 5);
    doc.text('Detalle', 130, y + 5);
    y += 7;

    doc.setTextColor(60, 60, 60);
    fallas.forEach((f, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(255, 240, 240);
        doc.rect(15, y, 180, 6, 'F');
      }

      const fInicio = new Date(f.inicio);
      const fFin = new Date(f.fin);
      const inicioFStr = `${fInicio.getDate()}/${fInicio.getMonth()+1} ${String(fInicio.getHours()).padStart(2,'0')}:${String(fInicio.getMinutes()).padStart(2,'0')}`;
      const finFStr = `${fFin.getDate()}/${fFin.getMonth()+1} ${String(fFin.getHours()).padStart(2,'0')}:${String(fFin.getMinutes()).padStart(2,'0')}`;

      doc.text(String(inicioFStr), 18, y + 4);
      doc.text(String(finFStr), 60, y + 4);
      doc.text(String(f.tipo || '---'), 100, y + 4);
      doc.text(String((f.detalle || '---').substring(0, 30)), 130, y + 4);
      y += 6;
    });
  }

  // ==================== PIE DE PÁGINA ====================
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: 'center' });
    doc.text('PlasmaGuard - Sistema de Monitoreo de Cadena de Frío', 105, 295, { align: 'center' });
  }

  // ==================== FIRMAS ====================
  doc.addPage();
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Firmas de Conformidad', 105, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.text('_____________________________', 30, 80);
  doc.text('Dirección del Banco de Sangre', 30, 90);

  doc.text('_____________________________', 120, 80);
  doc.text('Personal Encargado del Área', 120, 90);

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(fechaEmision, 105, 270, { align: 'center' });

  // ==================== GUARDAR PDF ====================
  const nombreArchivo = `Informe_PlasmaGuard_${inicioStr}_${finStr}.pdf`;
  doc.save(nombreArchivo);

  document.getElementById('vistaPreviaInforme').innerHTML = 
    `<p>✅ Informe generado con éxito. <br>Se descargó el archivo: <strong>${nombreArchivo}</strong></p>`;
}

// ==================== FUNCIÓN AUXILIAR: NOMBRE DEL MES ====================
function obtenerMes(numeroMes) {
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return meses[numeroMes];
}

// ==================== REPORTES ====================
function generarReporte() {
  const tipo = document.getElementById('tipoReporte').value;
  const descripcion = document.getElementById('descripcionReporte').value.trim();

  if (!descripcion) {
    alert('Por favor, describa su consulta, reclamo o sugerencia.');
    return;
  }

  if (descripcion.length < 10) {
    alert('La descripción debe tener al menos 10 caracteres.');
    return;
  }

  // Verificar jsPDF
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('❌ Error: La librería jsPDF no está cargada.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const sesion = obtenerSesion();
  const nombreUsuario = sesion ? sesion.nombre : 'Usuario';
  const institucion = (sesion && sesion.institucion && sesion.institucion.trim() !== '') 
    ? sesion.institucion 
    : 'Banco de Sangre de Referencia Departamental de Potosí';

  const hoy = new Date();
  const fechaEmision = `Potosí, ${hoy.getDate()} de ${obtenerMes(hoy.getMonth())} del ${hoy.getFullYear()}`;
  const horaEmision = `${hoy.getHours()}:${String(hoy.getMinutes()).padStart(2, '0')}`;

  // ==================== ENCABEZADO ====================
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('PLASMAGUARD', 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.text('Reporte de Consulta / Reclamo', 105, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.text(institucion, 105, 32, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(77, 184, 255);
  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);

  // ==================== DATOS DEL REPORTE ====================
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  let y = 50;
  doc.text(`Fecha de emisión: ${fechaEmision}`, 15, y);
  y += 6;
  doc.text(`Hora de emisión: ${horaEmision}`, 15, y);
  y += 6;
  doc.text(`Solicitado por: ${nombreUsuario}`, 15, y);
  y += 6;
  doc.text(`Institución: ${institucion}`, 15, y);
  y += 10;

  // ==================== TIPO DE REPORTE ====================
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Tipo de Reporte:', 15, y);
  y += 7;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  const tipos = {
    'consulta': 'Consulta',
    'reclamo': 'Reclamo',
    'sugerencia': 'Sugerencia',
    'falla': 'Reporte de Falla'
  };
  doc.text(tipos[tipo] || tipo, 20, y);
  y += 12;

  // ==================== DESCRIPCIÓN ====================
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Descripción:', 15, y);
  y += 7;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  // Dividir el texto en líneas que quepan en el ancho de la página
  const lineas = doc.splitTextToSize(descripcion, 170);
  lineas.forEach(linea => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text(linea, 20, y);
    y += 6;
  });

  y += 20;

  // ==================== FIRMA ====================
  if (y > 220) {
    doc.addPage();
    y = 40;
  }

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('_____________________________', 60, y + 30);
  doc.text('Firma del Solicitante', 75, y + 40);
  doc.text(nombreUsuario, 75, y + 46);

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(fechaEmision, 105, 270, { align: 'center' });

  // ==================== PIE DE PÁGINA ====================
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: 'center' });
    doc.text('PlasmaGuard - Sistema de Monitoreo de Cadena de Frío', 105, 295, { align: 'center' });
  }

  // ==================== GUARDAR PDF ====================
  const nombreArchivo = `Reporte_PlasmaGuard_${tipo}_${hoy.getFullYear()}${String(hoy.getMonth()+1).padStart(2,'0')}${String(hoy.getDate()).padStart(2,'0')}.pdf`;
  doc.save(nombreArchivo);

    const vistaPrevia = document.getElementById('vistaPreviaInforme');
  if (vistaPrevia) {
    vistaPrevia.innerHTML = `<p>✅ Reporte generado con éxito. <br>Se descargó el archivo: <strong>${nombreArchivo}</strong></p>`;
  }

  // Limpiar el formulario
  document.getElementById('descripcionReporte').value = '';
}
