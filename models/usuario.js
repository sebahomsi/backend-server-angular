const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'Nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'Email es necesario'] },
    password: { type: String, required: [true, 'Contraseña es necesario'] },
    img: { type: String },
    role: { type: String, required: [true, 'Rol es necesario'], default: 'USER_ROLE', enum: rolesValidos },
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Usuario', usuarioSchema);