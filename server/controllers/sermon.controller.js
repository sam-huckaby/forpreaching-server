const Sermon = require('../database/models/sermon.model');

// Create a new sermons in the DB
createSermon = async (req, res) => {
    // Create the sermon document (The model instance that will be saved to the DB)
    const newSermon = new Sermon({...req.body, creator: req.user.sub});

    // Check if the document was actually instantiated
    if (!newSermon) {
        // Something was missing from the request object, so it could not be persisted
        return res.status(400).json({ success: false, message: 'Sermon could not be created.' });
    }

    // Attempt to save the sermon document to the database
    try {
        let result = await newSermon.save();

        return res.status(200).json({
            success: true,
            id: newSermon._id,
            message: 'Sermon created!',
        });
    } catch (error) {
        console.log("Sermon persistence failed. Details:");
        console.log(error);

        // we failed to save the sermon, ESCAPE
        return res.status(500).json({
            error,
            message: 'Sermon not created!',
        });
    }
}

getTopTenSermons = async (req, res) => {
    await Sermon.find().sort({createdAt: 'desc'}).limit(10).exec((err, sermons) => {
        if (err) {
            return res.status(400).json({ success: false, error: err });
        }
        if (!sermons.length) {
            return res
                .status(404)
                .json({ success: false, error: `Sermons not found` });
        }

        // Truncate the sermon body for each of the top ten, so that they can't cheat to read them anyways
        for(let i = 0; i < sermons.length; i++) {
            let ellipsis = (sermons[i].body.length > 500);
            sermons[i].body = sermons[i].body.replace( /(<([^>]+)>)/ig, '').replace(/&nbsp;/ig, ' ').substring(0, 500);
            if (ellipsis) {
                sermons[i].body += '...';
            }
        }

        return res.status(200).json(sermons)
    });
}

module.exports = {
    createSermon,
    getTopTenSermons,
};