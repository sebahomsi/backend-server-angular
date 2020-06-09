const express = require('express');
const bcrypt = require('bcryptjs');

const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

const Usuario = require('../models/usuario');

// =======================================
// Obtener todos los usuarios
// =======================================
app.get('/usuario', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    // let hasta = req.query.hasta || 0;
    // hasta = Number(hasta);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios,
                        total: conteo
                    });
                });

            });

});



// =======================================
// Crear nuevo usuario
// =======================================
app.post('/usuario', (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });
});

// =======================================
// Actualizar usuario
// =======================================
app.put('/usuario/:id', verificaToken, (req, res) => {
    let _id = req.params.id;

    Usuario.findById(_id, (err, usuario) => {
        let body = req.body;

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `Error ${_id} no existe`,
                errors: {
                    message: 'No existe un usuario con ese id'
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = 'Aqui no está';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });

});

// =======================================
// Eliminar usuario
// =======================================
app.delete('/usuario/:id', verificaToken, (req, res) => {
    let _id = req.params.id;

    Usuario.findByIdAndRemove(_id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `Error ${_id} no existe`,
                errors: {
                    message: 'No existe un usuario con ese id'
                }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;