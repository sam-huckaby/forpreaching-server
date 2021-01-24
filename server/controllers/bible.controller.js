const BibleBook = require('../database/models/bibleBook.model');

// Create a new Study Guide in the DB
retrieveBibleMeta = async (req, res) => {
    // For this request, just return the entire collection of Bible books
    let books = await BibleBook.find({}).exec();
    
    if (!books.length) {
        return res
            .status(404)
            .json({ success: false, error: `No Bible metadata found.` });
    }
    return res.status(200).json(books);
}

module.exports = {
    retrieveBibleMeta,
};