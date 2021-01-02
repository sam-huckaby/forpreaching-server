const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Sermon = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        scripture: {
            type: String,
            required: true
        },
        summary: {
            type: String,
            default: null
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

module.exports = mongoose.model('Sermon', Sermon)