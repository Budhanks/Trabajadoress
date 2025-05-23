const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
  secret: '123a',
  resave: false,
  saveUninitialized: false
}));

// Middleware
function requireLogin(req, res, next) {
  if (!req.session.usuario) return res.redirect('/');
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.usuario?.es_admin) return res.redirect('/vista');
  next();
}

// Rutas
const authRoutes = require('./routes/auth');
const trabajadoresRoutes = require('./routes/trabajadores');
const graficasRoutes = require('./routes/graficas');

// Usos rutas
app.use('/', authRoutes);
app.use('/trabajadores', requireLogin, trabajadoresRoutes);
app.use('/graficas', requireLogin, graficasRoutes);


// Vistas protegidas 
app.get('/admin', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/vista', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'vista.html'));
});

app.get('/graficas', requireLogin, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'graficas.html'));
});


// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


