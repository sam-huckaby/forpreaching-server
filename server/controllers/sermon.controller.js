const mongoose = require('mongoose');
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
    await Sermon.find({
        featured: { $ne: null }
    }).sort({featured: 'desc'}).limit(10).exec((err, sermons) => {
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
        }).catch(async (err) => {
            // Let the user know that something failed
            return res.status(500).json({
                success: false,
                info: err.message,
            });
        });
}

updateSermon = async (req, res) => {
    // Let's just not mess around with possibly modifying ids...
    if(req.body._id) {
        delete req.body._id;
    }

    // Find the sermon to update
    let sermon = await Sermon.findOne({ _id: req.params.id });

    // Update the sermon with the new data
    sermon.overlay(req.body);

    // Save the sermon with the new data and handle any errors (like validation)
    await sermon.save().catch(async (err) => {
        // Let the user know that something failed
        return res.status(500).json({
            success: false,
            info: err.message,
        });
    });

    // Retrieve the newly updated sermon
    let updated = await Sermon.findOne({ _id: req.params.id });

    // Return the updated sermon to the user
    return res.status(200).json(updated);
}

deleteSermon = async (req, res) => {
    // TODO: update to deleteOne
    Sermon.deleteOne({ _id: req.params.id, creator: req.user.sub }, (err, results) => {
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
    
    if (!sermons) {
        return res
            .status(500)
            .json({ success: false, error: `Error retrieving your library.` });
    }
    return res.status(200).json(sermons);
}

appendComment = async (req, res) => {
    // Validate that there is a comment to add
    if(!req.body.body) {
        return res.status(500).json({ success: false, error: `Comment must include text.` });
    }

    // Find the sermon to comment on
    let sermon = await Sermon.findOne({ _id: req.params.id }).catch(async (err) => {
        // Let the user know that something failed
        return res.status(500).json({
            success: false,
            info: err.message,
        });
    });

    if(!sermon.allowComments) {
        return res.status(403).json({ success: false, error: `This sermon is not accepting comments.` });
    }

    sermon.comments.push({
        body: req.body.body,
        date: new Date()
    });

    // Save the sermon with the new data and handle any errors (like validation)
    await sermon.save().catch(async (err) => {
        // Let the user know that something failed
        return res.status(500).json({
            success: false,
            info: err.message,
        });
    });

    // Return a success status and (maybe) message
    return res.status(200).json({"message": "Added Comment!"});
}

featureSermon = async (req, res) => {
    if (!req.user.permissions || req.user.permissions.indexOf('administer:sermons') < 0) {
        res.status(403).json({status: 'Forbidden', reason: 'You do not have adequate authority to perform this action.'});
        return;
    }

    let found = await Sermon.findOne({ _id: req.params.id });

    found.featured = new Date();

    await found.save();

    res.status(200).json(found);
}

module.exports = {
    createSermon,
    getTopTenSermons,
    getSermonById,
    updateSermon,
    deleteSermon,
    getSermons,
    getUserSermons,
    appendComment,
    featureSermon,
};