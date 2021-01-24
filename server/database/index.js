const mongoose = require('mongoose');
const fs = require('fs');
// Go load environment variables
require('dotenv').config();
// Load Bible book model
const BibleBook = require('./models/bibleBook.model');

mongoose
    .connect('mongodb://'+process.env.DB_HOST+':'+process.env.DB_PORT+'/forpreaching', {
        useNewUrlParser:true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .catch(e => {
        console.error('Connection error', e.message)
    });

const db = mongoose.connection;

db.once('open', async function() {
    // Log the connection event
    console.log('Database Connection Established');

    let books = await BibleBook.find({});

    if (books.length < 66) {
        // Rebuild the Bible books metadata
        let rawdata = fs.readFileSync('./server/database/data/bible.json');
        let bible = JSON.parse(rawdata);
        for(let i = 0; i < bible.books.length; i++) {
            let newBook = new BibleBook(bible.books[i]);
            await newBook.save();
        }

        // Notify the logs that Bible metadata has been rebuilt
        console.log('Bible metadata loaded');
    } else {
        console.log('Bible metadata found');
    }
});

module.exports = db;