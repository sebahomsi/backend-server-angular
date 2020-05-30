const express = require('express');
const app = express();

const path = require('path');
const fs = require('fs');


app.get('/imagenes/:tipo/:img', (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        let pathNoImage = path.resolve(__dirname, '../assets/no-imagen.jpg');
        res.sendFile(pathNoImage);
    }
});

module.exports = app;