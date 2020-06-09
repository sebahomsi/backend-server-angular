// Requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Inicializar variables
const app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server index config
// const serveIndex = require('serve-index');
// app.use(express.static(_dirname + '/'));
// app.use('/uploads', serveIndex(_dirname + '/uploads'));


// Configuracion global de rutas
app.use(require('./routes/index.js'));

// Conexion a la DB
mongoose.connection
    .openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
        if (err) {
            throw err;
        }
        console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

    });


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});