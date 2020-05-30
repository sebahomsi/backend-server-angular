const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'Nombre es necesario'] },
    img: { type: String },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'Hospital es necesario'] }
});

module.exports = mongoose.model('Medico', medicoSchema);