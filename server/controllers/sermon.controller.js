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

getSermonById = async (req, res) => {
    Sermon.findOne({ _id: req.params.id }, (err, sermon) => {
            // If we failed the lookup, just get out of there
            if(err) {
                return res.status(400).json({
                    success: false,
                    error: 'Failed to find sermon',
                });
            }
    
            // If the user is already created, just move on
            if(!sermon) {
                return res.status(404).json({
                    success: false,
                    error: 'No sermon found with id ' + req.params.id,
                });
            }
    
            return res.status(200).json(sermon)
        });
}

updateSermon = async (req, res) => {
    // Let's just not mess around with possibly modifying ids...
    if(req.body._id) {
        delete req.body._id;
    }

    let updated = await Sermon.findOneAndUpdate({ _id: req.params.id }, req.body, {new: true});

    if(!updated) {
        return res.status(404).json({
            success: false,
            info: 'Unable to update sermon ' + req.params.id,
        });
    } else {
        return res.status(200).json(updated);
    }
}

deleteSermon = async (req, res) => {
    // TODO: update to deleteOne
    Sermon.remove({ _id: req.params.id, creator: req.user.sub }, (err, results) => {
        // If we failed the lookup, just get out of there
        if(err) {
            console.log('Sermon deletion error:');
            console.log(err);

            return res.status(400).json({
                success: false,
                error: 'Failed to delete sermon',
            });
        }

        if (results.deletedCount < 1) {
            return res.status(404).json({
                success: false,
                error: 'No sermon found to delete with that ID'
            });
        }

        return res.status(200).json({success: true});
    });
}

getSermons = async (req, res) => {
    let query = {};
    let searchParams = Object.keys(req.query);

    // Convert the values given to Regex for mongo to search
    for(let prop in searchParams) {
        query[searchParams[prop]] = {$regex: req.query[searchParams[prop]], $options: 'i'}
    }

    let sermons = await Sermon.find(query).exec();
    
    if (!sermons.length) {
        return res
            .status(404)
            .json({ success: false, error: `No sermons found.` });
    }
    return res.status(200).json(sermons);
}

getUserSermons = async (req, res) => {
    let sermons = await Sermon.find({ creator: req.user.sub }).exec();
    
    if (!sermons.length) {
        return res
            .status(404)
            .json({ success: false, error: `No sermons found.` });
    }
    return res.status(200).json(sermons);
}

module.exports = {
    createSermon,
    getTopTenSermons,
    getSermonById,
    updateSermon,
    deleteSermon,
    getSermons,
    getUserSermons,
};