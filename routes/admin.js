
const express = require('express');
const router = express.Router();

// Middleware de verificación de admin
const isAdmin = (req, res, next) => {
  if (req.session.usuario && req.session.usuario.es_admin) {
    return next();
  }
  res.redirect('/auth/login');
};

router.get('/dashboard', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin.html'));
});

module.exports = router;