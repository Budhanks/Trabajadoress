// Función genérica para construir una gráfica
function crearGrafica(idCanvas, etiquetas, datos, titulo, tipo = 'bar') {
  const ctx = document.getElementById(idCanvas).getContext('2d');
  new Chart(ctx, {
    type: tipo,
    data: {
      labels: etiquetas,
      datasets: [{
        label: titulo,
        data: datos,
        backgroundColor: [
          '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
          '#59a14f', '#edc949', '#af7aa1', '#ff9da7'
        ],
        borderColor: '#333',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Cargar datos desde el backend y crear gráficas
async function cargarDatosYGraficas() {
  try {
    // Género
    const resGenero = await fetch('/graficas/genero');
    const datosGenero = await resGenero.json();
    crearGrafica(
      'graficaGenero',
      datosGenero.map(d => d.genero),
      datosGenero.map(d => d.cantidad),
      'Trabajadores por Género'
    );

    // Categoría
    const resCategoria = await fetch('/graficas/categoria');
    const datosCategoria = await resCategoria.json();
    crearGrafica(
      'graficaCategoria',
      datosCategoria.map(d => d.categoria),
      datosCategoria.map(d => d.cantidad),
      'Trabajadores por Categoría'
    );

    // Grado
    const resGrado = await fetch('/graficas/grado');
    const datosGrado = await resGrado.json();
    crearGrafica(
      'graficaGrado',
      datosGrado.map(d => d.grado),
      datosGrado.map(d => d.cantidad),
      'Trabajadores por Grado Académico'
    );

    // Antigüedad
    const resAntiguedad = await fetch('/graficas/antiguedad');
    const datosAntiguedad = await resAntiguedad.json();
    crearGrafica(
      'graficaAntiguedad',
      datosAntiguedad.map(d => d.rango),
      datosAntiguedad.map(d => d.cantidad),
      'Trabajadores por Antigüedad (UNAM)'
    );
  } catch (err) {
    console.error('Error cargando gráficas:', err);
  }
}

document.addEventListener('DOMContentLoaded', cargarDatosYGraficas);
