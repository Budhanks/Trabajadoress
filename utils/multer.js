
const express = require('express');
const router = express.Router();

// Middleware de autenticación normal
const isAuthenticated = (req, res, next) => {
  if (req.session.usuario) {
    return next();
  }
  res.redirect('/auth/login');
};

router.get('/publica', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/vista.html'));
});

module.exports = router;