const pool = require('../db/conexion');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Asegurar que existe la carpeta uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Controlador de trabajadores
const trabajadoresController = {
  // Obtener todos los trabajadores (admin)
  obtenerTodos: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT t.*, c.nombre AS categoria, g.nombre AS grado
        FROM trabajadores t
        LEFT JOIN categorias c ON t.id_categoria = c.id_categoria
        LEFT JOIN grados_academicos g ON t.id_grado = g.id_grado
        ORDER BY t.id_trabajador;
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error en obtenerTodos:', error);
      res.status(500).json({ error: 'Error al obtener trabajadores' });
    }
  },

  // Obtener trabajadores para vista pública (sin datos sensibles)
  obtenerPublicos: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          numero_trabajador, nombre_completo, genero, 
          c.nombre AS categoria, g.nombre AS grado, 
          antiguedad_unam, antiguedad_carrera, email_institucional
        FROM trabajadores t
        LEFT JOIN categorias c ON t.id_categoria = c.id_categoria
        LEFT JOIN grados_academicos g ON t.id_grado = g.id_grado
        ORDER BY t.id_trabajador;
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error en obtenerPublicos:', error);
      res.status(500).json({ error: 'Error al obtener trabajadores públicos' });
    }
  },

  // Crear nuevo trabajador
  crear: async (req, res) => {
    const {
      numero_trabajador, nombre_completo, genero, rfc, curp,
      id_categoria, id_grado, antiguedad_unam, antiguedad_carrera,
      email_institucional, telefono_casa, telefono_celular, direccion
    } = req.body;

    // Validaciones básicas
    if (!numero_trabajador || !nombre_completo || !id_categoria || !id_grado) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios: numero_trabajador, nombre_completo, id_categoria, id_grado' 
      });
    }

    try {
      const result = await pool.query(`
        INSERT INTO trabajadores (
          numero_trabajador, nombre_completo, genero, rfc, curp,
          id_categoria, id_grado, antiguedad_unam, antiguedad_carrera,
          email_institucional, telefono_casa, telefono_celular, direccion
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *;
      `, [
        numero_trabajador, nombre_completo, genero, rfc, curp,
        id_categoria, id_grado, antiguedad_unam, antiguedad_carrera,
        email_institucional, telefono_casa, telefono_celular, direccion
      ]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error en crear:', error);
      if (error.code === '23505') { // Código de PostgreSQL para violación de unicidad
        res.status(409).json({ error: 'El número de trabajador ya existe' });
      } else {
        res.status(500).json({ error: 'Error al crear trabajador' });
      }
    }
  },

  // Actualizar trabajador
  actualizar: async (req, res) => {
    const id = req.params.id;
    const {
      numero_trabajador, nombre_completo, genero, rfc, curp,
      id_categoria, id_grado, antiguedad_unam, antiguedad_carrera,
      email_institucional, telefono_casa, telefono_celular, direccion
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de trabajador inválido' });
    }

    try {
      const result = await pool.query(`
        UPDATE trabajadores SET
          numero_trabajador = $1,
          nombre_completo = $2,
          genero = $3,
          rfc = $4,
          curp = $5,
          id_categoria = $6,
          id_grado = $7,
          antiguedad_unam = $8,
          antiguedad_carrera = $9,
          email_institucional = $10,
          telefono_casa = $11,
          telefono_celular = $12,
          direccion = $13
        WHERE id_trabajador = $14
        RETURNING *;
      `, [
        numero_trabajador, nombre_completo, genero, rfc, curp,
        id_categoria, id_grado, antiguedad_unam, antiguedad_carrera,
        email_institucional, telefono_casa, telefono_celular, direccion,
        id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Trabajador no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error en actualizar:', error);
      res.status(500).json({ error: 'Error al actualizar trabajador' });
    }
  },

  // Eliminar trabajador
  eliminar: async (req, res) => {
    const id = req.params.id;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de trabajador inválido' });
    }

    try {
      const result = await pool.query(`DELETE FROM trabajadores WHERE id_trabajador = $1`, [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Trabajador no encontrado' });
      }

      res.sendStatus(204);
    } catch (error) {
      console.error('Error en eliminar:', error);
      res.status(500).json({ error: 'Error al eliminar trabajador' });
    }
  },

  // Importar trabajadores desde archivo Excel
  importarExcel: async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha enviado ningún archivo' });
    }

    try {
      // Verificar que el archivo existe
      if (!fs.existsSync(req.file.path)) {
        return res.status(400).json({ error: 'Archivo no encontrado' });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (data.length === 0) {
        fs.unlinkSync(req.file.path); // Limpiar archivo
        return res.status(400).json({ error: 'El archivo Excel está vacío' });
      }

      let insertados = 0;
      let errores = 0;

      for (const row of data) {
        try {
          const valores = [
            row.numero_trabajador, row.nombre_completo, row.genero, row.rfc, row.curp,
            row.id_categoria, row.id_grado, row.antiguedad_unam, row.antiguedad_carrera,
            row.email_institucional, row.telefono_casa, row.telefono_celular, row.direccion
          ];

          const result = await pool.query(`
            INSERT INTO trabajadores (
              numero_trabajador, nombre_completo, genero, rfc, curp,
              id_categoria, id_grado, antiguedad_unam, antiguedad_carrera,
              email_institucional, telefono_casa, telefono_celular, direccion
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            ON CONFLICT (numero_trabajador) DO NOTHING;
          `, valores);

          if (result.rowCount > 0) {
            insertados++;
          }
        } catch (rowError) {
          console.error('Error al insertar fila:', rowError);
          errores++;
        }
      }

      // Limpiar archivo temporal
      fs.unlinkSync(req.file.path);
      
      res.json({ 
        success: true, 
        mensaje: `Importación completada. ${insertados} registros insertados, ${errores} errores.`
      });
    } catch (error) {
      console.error('Error en importarExcel:', error);
      // Limpiar archivo en caso de error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Error al importar trabajadores desde Excel' });
    }
  },

  // Métodos para gráficas
  graficaGenero: async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT genero, COUNT(*) AS cantidad FROM trabajadores GROUP BY genero`
      );
      res.json(rows);
    } catch (err) {
      console.error('Error al obtener gráfica de género:', err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  graficaCategoria: async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT c.nombre AS categoria, COUNT(*) AS cantidad
         FROM trabajadores t
         JOIN categorias c ON t.id_categoria = c.id_categoria
         GROUP BY c.nombre`
      );
      res.json(rows);
    } catch (err) {
      console.error('Error al obtener gráfica de categoría:', err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  graficaGrado: async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT g.nombre AS grado, COUNT(*) AS cantidad
         FROM trabajadores t
         JOIN grados_academicos g ON t.id_grado = g.id_grado
         GROUP BY g.nombre`
      );
      res.json(rows);
    } catch (err) {
      console.error('Error al obtener gráfica de grado académico:', err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  graficaAntiguedad: async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT
          CASE
            WHEN antiguedad_unam < 5 THEN 'Menos de 5 años'
            WHEN antiguedad_unam < 10 THEN '5 a 9 años'
            WHEN antiguedad_unam < 20 THEN '10 a 19 años'
            ELSE '20 años o más'
          END AS rango,
          COUNT(*) AS cantidad
        FROM trabajadores
        GROUP BY rango
        ORDER BY rango`
      );
      res.json(rows);
    } catch (err) {
      console.error('Error al obtener gráfica de antigüedad:', err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  },

  exportarExcel: async (req, res) => {
    try {
      // 1. Obtener los datos (todos los campos, admin)
      const result = await pool.query(`
        SELECT 
          numero_trabajador, nombre_completo, genero, rfc, curp,
          id_categoria, id_grado, antiguedad_unam, antiguedad_carrera,
          email_institucional, telefono_casa, telefono_celular, direccion
        FROM trabajadores
        ORDER BY id_trabajador
      `);

      // 2. Convertir a hoja de Excel
      const worksheet = XLSX.utils.json_to_sheet(result.rows);
      const workbook  = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');

      // 3. Generar buffer
      const buffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'buffer'
      });

      // 4. Enviar respuesta con cabeceras para descarga
      res.setHeader('Content-Disposition', 'attachment; filename="trabajadores.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);

    } catch (error) {
      console.error('Error exportando a Excel:', error);
      res.status(500).json({ error: 'No se pudo exportar a Excel' });
    }
  },

  filtrar: async (req, res) => {
    const { categoria, grado, busqueda } = req.query;

    let query = `
      SELECT 
        numero_trabajador, nombre_completo, genero,
        c.nombre AS categoria, g.nombre AS grado,
        antiguedad_unam, antiguedad_carrera, email_institucional
      FROM trabajadores t
      LEFT JOIN categorias c ON t.id_categoria = c.id_categoria
      LEFT JOIN grados_academicos g ON t.id_grado = g.id_grado
    `;

    const condiciones = [];
    const valores = [];

    if (categoria) {
      condiciones.push(`t.id_categoria = $${valores.length + 1}`);
      valores.push(categoria);
    }

    if (grado) {
      condiciones.push(`t.id_grado = $${valores.length + 1}`);
      valores.push(grado);
    }

    // Agregar filtro de búsqueda por texto (solo en categoría y grado académico)
    if (busqueda && busqueda.trim() !== '') {
      condiciones.push(`(
        LOWER(c.nombre) LIKE LOWER(${valores.length + 1}) OR
        LOWER(g.nombre) LIKE LOWER(${valores.length + 1})
      )`);
      valores.push(`%${busqueda.trim()}%`);
    }

    if (condiciones.length > 0) {
      query += ' WHERE ' + condiciones.join(' AND ');
    }

    query += ' ORDER BY t.id_trabajador';

    try {
      const result = await pool.query(query, valores);
      res.json(result.rows);
    } catch (error) {
      console.error('Error al filtrar trabajadores:', error);
      res.status(500).json({ error: 'Error al filtrar trabajadores' });
    }
  }

};




module.exports = trabajadoresController;