const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');
const app = express();

const Hospital = require('../models/hospital');

// =======================================
// Obtener todos los hospitales
// =======================================
app.get('/hospital', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    // let hasta = req.query.hasta || 0;
    // hasta = Number(hasta);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                });
            });
        });
});

// =======================================
// Crear nuevo usuario
// =======================================
app.post('/hospital', verificaToken, (req, res) => {
    let body = req.body;

    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});

// =======================================
// Actualizar hospital
// =======================================
app.put('/hospital/:id', verificaToken, (req, res) => {
    let _id = req.params.id;

    Hospital.findById(_id, (err, hospital) => {
        let body = req.body;

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `Error ${_id} no existe`,
                errors: {
                    message: 'No existe un hospital con ese id'
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

});

// =======================================
// Eliminar hospital
// =======================================
app.delete('/hospital/:id', verificaToken, (req, res) => {
    let _id = req.params.id;

    Hospital.findByIdAndRemove(_id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `Error ${_id} no existe`,
                errors: {
                    message: 'No existe un hospital con ese id'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;