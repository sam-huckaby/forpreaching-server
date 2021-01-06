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
        video: {
            type: String,
            default: null,
            validate: {
                validator: (entry) => {
                    if(entry === '' || entry === undefined) {
                        return true;
                    }
                    return (/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(\?\S*)?$/i.test(entry));
                },
                message: 'Currently, only valid Youtube links are accepted.'
            }
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

// Create a custom update method that syncs new data into the model (TODO: Make this cleaner)
Sermon.methods.overlay = function (newData) {
    // modify the current document to have the most up-to-date data
    this.title = newData.title || this.title;
    this.scripture = newData.scripture || this.scripture;
    this.summary = newData.summary || this.summary;
    this.video = newData.video || this.video;
    this.body = newData.body || this.body;
    this.creator = newData.creator || this.creator;
}

module.exports = mongoose.model('Sermon', Sermon)