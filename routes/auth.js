const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Mostrar formulario de login en GET /
router.get('/', authController.mostrarLogin);

// Procesar login en POST /
router.post('/', authController.login);

// Logout (puede quedarse en /logout)
router.get('/logout', authController.logout);

module.exports = router;
