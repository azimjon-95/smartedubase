const mongoose = require('mongoose');

const balansSchema = new mongoose.Schema({
    balans: { type: Number },
    eduId: { type: String },

});

const Balans = mongoose.model('balans', balansSchema);
module.exports = Balans;



