const express = require('express');
const router  = express.Router();
const upload  = require('../utils/multer');
const trabajadoresController = require('../controllers/trabajadoresController');


router.get('/',             trabajadoresController.obtenerTodos);
router.get('/publico',      trabajadoresController.obtenerPublicos);
router.post('/',            trabajadoresController.crear);
router.put('/:id',          trabajadoresController.actualizar);
router.delete('/:id',       trabajadoresController.eliminar);
router.post('/cargar-excel',upload.single('archivo'),trabajadoresController.importarExcel);
router.get('/exportar-excel', trabajadoresController.exportarExcel);
router.get('/filtrar', trabajadoresController.filtrar);

module.exports = router;
