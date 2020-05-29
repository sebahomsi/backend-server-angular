const express = require('express');
const app = express();

app.use(require('./usuario'));
app.use(require('./login'));

app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Todo joya'
    });
});

module.exports = app;