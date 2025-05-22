
const path = require('path');
const pool = require('../db/conexion');

const authController = {

    mostrarLogin: (req, res) => {
        res.sendFile(path.join(__dirname, '../views/login.html'));
    },

    // Procesar login
    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            const result = await pool.query(
                'SELECT id_usuario, username, password, es_admin::boolean FROM usuarios WHERE username = $1',
                [username]
            );

            if (result.rows.length === 0) {
                return res.redirect('/auth/login?error=1');
            }

            const user = result.rows[0];

            // Comparación directa (sin bcrypt)
            if (password !== user.password) {
                return res.redirect('/auth/login?error=1');
            }

            // Guardar sesión del usuario
            req.session.usuario = {
                id: user.id_usuario,
                username: user.username,
                es_admin: user.es_admin
            };

            // Redirección basada en el rol
            if (user.es_admin) {
                return res.redirect('/admin');
            } else {
                return res.redirect('/vista');
            }

        } catch (err) {
            console.error('Error en login:', err);
            return res.redirect('/auth/login?error=1');
        }
    },

    // Logout
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
            }
            res.redirect('/');
        });
    }
};

module.exports = authController;