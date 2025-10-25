const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/capital_one_db', { useNewUrlParser: true, useUnifiedTopology: true });

const gastoSchema = new mongoose.Schema({
  precio: Number,
  categoria: String,
  establecimiento: String,
  es_hormiga: Boolean
});

module.exports = { Gastos: mongoose.model('Gasto', gastoSchema) };