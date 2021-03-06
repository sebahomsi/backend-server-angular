const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

// =======================================
// Busqueda general
// =======================================
app.get('/busqueda/todo/:busqueda', (req, res) => {

    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

// =======================================
// Busqueda por coleccion
// =======================================
app.get('/busqueda/coleccion/:tabla/:busqueda', (req, res) => {

    let busqueda = req.params.busqueda;
    let tabla = req.params.tabla;
    let regex = new RegExp(busqueda, 'i');

    // if (tabla === "medico") {
    //     buscarMedicos(busqueda, regex).then(medicos => {
    //         res.status(200).json({
    //             ok: true,
    //             medicos
    //         });
    //     });
    // } else if (tabla === "hospital") {
    //     buscarHospitales(busqueda, regex).then(hospitales => {
    //         res.status(200).json({
    //             ok: true,
    //             hospitales
    //         });
    //     });
    // } else if (tabla === "usuario") {
    //     buscarUsuarios(busqueda, regex).then(usuarios => {
    //         res.status(200).json({
    //             ok: true,
    //             usuarios
    //         });
    //     });
    // } else {
    //     res.status(500).json({
    //         ok: true,
    //         error: {
    //             message: 'Ruta incorrecta'
    //         }
    //     });
    // }

    switch (tabla) {
        case 'medico':
            buscarMedicos(busqueda, regex).then(medicos => {
                res.status(200).json({
                    ok: true,
                    medicos
                });
            });
            break;

        case 'hospital':
            buscarHospitales(busqueda, regex).then(hospitales => {
                res.status(200).json({
                    ok: true,
                    hospitales
                });
            });
            break;

        case 'usuario':
            buscarUsuarios(busqueda, regex).then(usuarios => {
                res.status(200).json({
                    ok: true,
                    usuarios
                });
            });
            break;

        default:
            return res.status(500).json({
                ok: true,
                error: {
                    message: 'Ruta incorrecta'
                }
            });
    }


});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;