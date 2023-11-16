const mongoose = require('mongoose');
const crypto = require('crypto');

const dataSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    symptoms: {
        required:false,
        type:Array
    },
    hash : String,
    salt : String

})

dataSchema.methods.setPassword = function(password) {
   this.salt = crypto.randomBytes(16).toString('hex');
   this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`)

}

dataSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`)
    return this.hash === hash;
}

module.exports = mongoose.model('Data', dataSchema)