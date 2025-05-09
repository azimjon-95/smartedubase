const mongoose = require('mongoose');

// Certificate schema yaratish
const certificateSchema = new mongoose.Schema({
    fileName: String,
    filePath: String,
    fullName: String,
    date: String,
    teacherFullName: String,
    directorFullName: String,
    level: String,
    uploadDate: { type: Date, default: Date.now },
});

const CertificateModel = mongoose.model('Certificate', certificateSchema);

module.exports = {
    CertificateModel
}
