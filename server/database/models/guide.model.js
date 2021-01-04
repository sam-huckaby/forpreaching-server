const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Passage = new Schema(
    {
        body: {
            type: String,
            required: true
        },
        reflection: {
            type: String,
            required: false
        },
    },
    {
        timestamps: true, // introduces createdAt and updatedAt
        strict: false
    },
)

const Study = new Schema(
    {
        caption: {
            type: String,
            required: true
        },
        scripture: {
            type: String,
            required: true
        },
        passages: [ Passage ],
    },
    {
        timestamps: true, // introduces createdAt and updatedAt
        strict: false
    },
)

const Guide = new Schema(
    {
        // This should let me use the "populate()" method to append the sermon if I want
        sermon: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        introduction: {
            type: String,
            required: true
        },
        instructions: {
            type: String,
            default: null
        },
        studies: [ Study ],
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

module.exports = mongoose.model('Guide', Guide)