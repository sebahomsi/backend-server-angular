const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');

const SEED = require('../config/config').SEED;
const CLIENT_ID = require('../config/config').CLIEND_ID;
const app = express();

const client = new OAuth2Client(CLIENT_ID);


const Usuario = require('../models/usuario');

// ====================================
// Autenticacion normal
// ====================================
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

// ====================================
// Autenticacion por Google
// ====================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/login/google', async(req, res) => {

    let token = req.body.token;

    let googleUser = await verify(token)
        .catch(err => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuario) {
            if (usuario.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'debe utilizar su autenticacion normal',
                    errors: err
                });
            } else {
                let token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario,
                    id: usuario.id,
                    token
                });
            }
        } else {
            // El usuario no existe hay que crearlo
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true
            usuario.password = ':)';

            usuario.save((err, usuario) => {
                let token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario,
                    id: usuario.id,
                    token
                });
            });
        }
    });
});

module.exports = app;