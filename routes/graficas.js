const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadoresController');

router.get('/genero', trabajadoresController.graficaGenero);
router.get('/categoria', trabajadoresController.graficaCategoria);
router.get('/grado', trabajadoresController.graficaGrado);
router.get('/antiguedad', trabajadoresController.graficaAntiguedad);

module.exports = router;
