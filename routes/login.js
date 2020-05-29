const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;
const app = express();

const Usuario = require('../models/usuario');

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - email`,
                errors: {
                    message: 'Datos de autenticacion incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - pass`,
                errors: {
                    message: 'Datos de autenticacion incorrectos'
                }
            });
        }

        // Crear un token!
        usuario.password = 'Aqui no está';
        let token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario,
            id: usuario.id,
            token
        });
    });




});

module.exports = app;