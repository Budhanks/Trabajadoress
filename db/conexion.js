const { Pool } = require('pg');

// Configuración de conexión (ajústala a tus credenciales locales o de Render)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',    
  database: 'secretariatecnica',
  password: '1234',
  port: 5432
});

module.exports = pool;
