const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;


let verificaToken = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });
}

module.exports = {
    verificaToken
}