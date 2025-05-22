const pool = require('../db/conexion');
const XLSX = require('xlsx');
const fs = require('fs');

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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      res.status(500).json({ error: 'Error al crear trabajador' });
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
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar trabajador' });
    }
  },

  // Eliminar trabajador
  eliminar: async (req, res) => {
    const id = req.params.id;
    try {
      await pool.query(`DELETE FROM trabajadores WHERE id_trabajador = $1`, [id]);
      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar trabajador' });
    }
  },

  // Importar trabajadores desde archivo Excel
  importarExcel: async (req, res) => {
    try {
      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      for (const row of data) {
        const valores = [
          row.numero_trabajador, row.nombre_completo, row.genero, row.rfc, row.curp,
          row.id_categoria, row.id_grado, row.antiguedad_unam, row.antiguedad_carrera,
          row.email_institucional, row.telefono_casa, row.telefono_celular, row.direccion
        ];

        await pool.query(`
          INSERT INTO trabajadores (
            numero_trabajador, nombre_completo, genero, rfc, curp,
            id_categoria, id_grado, antiguedad_unam, antiguedad_carrera,
            email_institucional, telefono_casa, telefono_celular, direccion
          ) VALUES (${valores.map((_, i) => `$${i + 1}`).join(',')})
          ON CONFLICT (numero_trabajador) DO NOTHING;
        `, valores);
      }

      fs.unlinkSync(req.file.path); // eliminar archivo temporal
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al importar trabajadores desde Excel' });
    }
  },

  // Métodos para gráficas (agregados correctamente con comas)
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
  }
};

module.exports = trabajadoresController;