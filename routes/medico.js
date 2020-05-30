const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

const Medico = require('../models/medico');

// =======================================
// Obtener todos los medicos
// =======================================
app.get('/medico', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    // let hasta = req.query.hasta || 0;
    // hasta = Number(hasta);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });
            });
        });
});

// =======================================
// Crear nuevo medico
// =======================================
app.post('/medico', verificaToken, (req, res) => {
    let body = req.body;

    let medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});

// =======================================
// Actualizar medico
// =======================================
app.put('/medico/:id', verificaToken, (req, res) => {
    let _id = req.params.id;

    Medico.findById(_id, (err, medico) => {
        let body = req.body;

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `Error ${_id} no existe`,
                errors: {
                    message: 'No existe un medico con ese id'
                }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });

});

// =======================================
// Eliminar medico
// =======================================
app.delete('/medico/:id', verificaToken, (req, res) => {
    let _id = req.params.id;

    Medico.findByIdAndRemove(_id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `Error ${_id} no existe`,
                errors: {
                    message: 'No existe un medico con ese id'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;