const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Illustration = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            default: null
        },
        creator: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true, // introduces createdAt and updatedAt
        strict: false
    },
)

// ====================== model methods ======================

// // generate a password hash
// Illustration.methods.setPassword = function(password) {
//     // Set the password to the salted password hash
//     this.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
// };

// // checking if password is valid
// Illustration.methods.validatePassword = async function(password) {
//     // Simple hash check of the stored password
//     return bcrypt.compareSync(password, this.local.password);
// };

module.exports = mongoose.model('Illustration', Illustration)