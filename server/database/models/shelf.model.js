const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Binder = new Schema(
    {
        name: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true, // introduces createdAt and updatedAt
        strict: false
    },
);

const Shelf = new Schema(
    {
        userId: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        binders: [ Binder ],
    },
    {
        timestamps: true, // introduces createdAt and updatedAt
        strict: false
    },
)

module.exports = mongoose.model('Shelf', Shelf)