const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BibleBook = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        OsisID: {
            type: String,
            required: true
        },
        volume: {
            type: String,
            required: true
        },
        aliases: {
            type: [String]
        },
        chapterCount: {
            type: Number
        },
        chapters: [
            {
                number: Number,
                verseCount: Number
            }
        ],
    },
    {
        timestamps: true, // introduces createdAt and updatedAt
        strict: false
    },
)

module.exports = mongoose.model('BibleBook', BibleBook)