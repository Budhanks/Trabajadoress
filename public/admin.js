document.addEventListener('DOMContentLoaded', () => {
  cargarTrabajadores();
  document.getElementById('formulario').addEventListener('submit', guardarTrabajador);
  document.getElementById('archivoExcel').addEventListener('change', importarExcel);
});

let trabajadorEditando = null;

async function cargarTrabajadores() {
  try {
    const res = await fetch('/trabajadores');
    const data = await res.json();

    const tbody = document.querySelector('#tabla tbody');
    tbody.innerHTML = '';

    data.forEach(trabajador => {
      const fila = `
        <tr>
          <td>${trabajador.numero_trabajador}</td>
          <td>${trabajador.nombre_completo}</td>
          <td>${trabajador.genero}</td>
          <td>${trabajador.rfc}</td>
          <td>${trabajador.curp}</td>
          <td>${trabajador.categoria}</td>
          <td>${trabajador.grado}</td>
          <td>${trabajador.antiguedad_unam}</td>
          <td>${trabajador.antiguedad_carrera}</td>
          <td>${trabajador.email_institucional}</td>
          <td>${trabajador.telefono_casa}</td>
          <td>${trabajador.telefono_celular}</td>
          <td>${trabajador.direccion}</td>
          <td>
            <button onclick='editarTrabajador(${JSON.stringify(trabajador)})'>✏️</button>
            <button onclick='eliminarTrabajador(${trabajador.id_trabajador})'>🗑️</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  } catch (err) {
    console.error('Error al cargar trabajadores:', err);
  }
}

function editarTrabajador(trabajador) {
  trabajadorEditando = trabajador.id_trabajador;
  const form = document.getElementById('formulario');
  Object.keys(trabajador).forEach(key => {
    if (form[key]) form[key].value = trabajador[key];
  });
}

async function eliminarTrabajador(id) {
  if (!confirm('¿Seguro que deseas eliminar este trabajador?')) return;
  try {
    await fetch(`/trabajadores/${id}`, { method: 'DELETE' });
    cargarTrabajadores();
  } catch (err) {
    console.error('Error al eliminar:', err);
  }
}

async function guardarTrabajador(e) {
  e.preventDefault();
  const form = e.target;
  const datos = Object.fromEntries(new FormData(form));

  const method = trabajadorEditando ? 'PUT' : 'POST';
  const url = trabajadorEditando ? `/trabajadores/${trabajadorEditando}` : '/trabajadores';

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    form.reset();
    trabajadorEditando = null;
    cargarTrabajadores();
  } catch (err) {
    console.error('Error al guardar trabajador:', err);
  }
}

async function importarExcel() {
  const input = document.getElementById('archivoExcel');
  const formData = new FormData();
  formData.append('archivo', input.files[0]);

  try {
    await fetch('/trabajadores/cargar-excel', {
      method: 'POST',
      body: formData
    });
    alert('Importación exitosa');
    input.value = '';
    cargarTrabajadores();
  } catch (err) {
    console.error('Error al importar Excel:', err);
    alert('Error al importar Excel');
  }
}
