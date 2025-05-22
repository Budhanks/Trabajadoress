const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');

// Rutas de autenticación
router.get('/', authController.mostrarLogin);
router.post('/', authController.login);
router.get('/logout', authController.logout);

module.exports = router;