const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadoresController');
const upload = require('../utils/multer'); // para importar Excel

// 🔹 Rutas de trabajadores

// Obtener todos (para vista admin)
router.get('/', trabajadoresController.obtenerTodos);

// Obtener para vista pública (oculta datos sensibles)
router.get('/publico', trabajadoresController.obtenerPublicos);

// Crear nuevo trabajador
router.post('/', trabajadoresController.crear);

// Actualizar trabajador
router.put('/:id', trabajadoresController.actualizar);

// Eliminar trabajador
router.delete('/:id', trabajadoresController.eliminar);

// Importar trabajadores desde archivo Excel
router.post('/importar-excel', upload.single('archivo'), trabajadoresController.importarExcel);

module.exports = router;
