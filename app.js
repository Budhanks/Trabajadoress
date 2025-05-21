// app.js
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const express = require('express');
const path = require('path');
const session = require('express-session');
// connect-pg-simple
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./config/conexion');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
