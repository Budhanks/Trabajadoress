document.addEventListener('DOMContentLoaded', () => {
  cargarTrabajadores();
  cargarFiltros();
});

async function cargarTrabajadores(query = '') {
  try {
    const res = await fetch(`/trabajadores/filtrar${query}`);
    const data = await res.json();

    const tbody = document.querySelector('#tabla tbody');
    tbody.innerHTML = '';

    data.forEach((trabajador, i) => {
      const fila = `
        <tr>
          <td>${i + 1}</td>
          <td>${trabajador.nombre_completo}</td>
          <td>${trabajador.genero}</td>
          <td>${trabajador.categoria}</td>
          <td>${trabajador.grado}</td>
          <td>${trabajador.antiguedad_unam}</td>
          <td>${trabajador.antiguedad_carrera}</td>
          <td>${trabajador.email_institucional}</td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  } catch (err) {
    console.error('Error al cargar trabajadores:', err);
  }
}

async function cargarFiltros() {
  try {
    const [categoriasRes, gradosRes] = await Promise.all([
      fetch('/trabajadores/categorias'),
      fetch('/trabajadores/grados')
    ]);

    const categorias = await categoriasRes.json();
    const grados = await gradosRes.json();

    const categoriaSelect = document.getElementById('categoria');
    const gradoSelect = document.getElementById('grado');

    categoriaSelect.innerHTML = `<option value="">Todas</option>`;
    gradoSelect.innerHTML = `<option value="">Todos</option>`;

    categorias.forEach(c => {
      categoriaSelect.innerHTML += `<option value="${c.id_categoria}">${c.nombre}</option>`;
    });

    grados.forEach(g => {
      gradoSelect.innerHTML += `<option value="${g.id_grado}">${g.nombre}</option>`;
    });
  } catch (err) {
    console.error('Error al cargar filtros:', err);
  }
}

async function filtrar() {
  const categoria = document.getElementById('categoria').value;
  const grado = document.getElementById('grado').value;

  const query = new URLSearchParams();
  if (categoria) query.append('categoria', categoria);
  if (grado) query.append('grado', grado);

  await cargarTrabajadores('?' + query.toString());
}
