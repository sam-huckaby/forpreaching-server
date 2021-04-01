const mongoose = require('mongoose');

const Illustration = require('../database/models/illustration.model');

// Create a new illustration in the DB
createIllustration = async (req, res, next) => {
    // Create the illustration document (The model instance that will be saved to the DB)
    const newIllustration = new Illustration({...req.body, creator: req.user.sub});

    // Check if the document was actually instantiated
    if (!newIllustration) {
        // Something was missing from the request object, so it could not be persisted
        res.status(400).json({ success: false, message: 'Illustration could not be created.' });
        return next();
    }

    // Attempt to save the illustration document to the database
    try {
        await newIllustration.save();

        res.status(200).json({
            success: true,
            id: newIllustration._id,
            message: 'Illustration created!',
        });
        next();
    } catch (error) {
        // we failed to save the illustration, ESCAPE
        res.status(500).json({
            error,
            message: 'Illustration not created!',
        });
        next();
    }
}

deleteIllustration = async (req, res, next) => {
    Illustration.deleteOne({ _id: req.params.id, creator: req.user.sub }, (err, results) => {
        // If we failed the lookup, just get out of there
        if(err) {
            res.status(400).json({
                success: false,
                error: 'Failed to delete illustration',
            });
            return next();
        }

        if (results.deletedCount < 1) {
            res.status(404).json({
                success: false,
                error: 'No illustration found to delete with that ID'
            });
            return next();
        }

        res.status(200).json({success: true});
        next();
    });
}

getIllustrations = async (req, res, next) => {
    let query = {};
    let searchParams = Object.keys(req.query);

    // Convert the values given to Regex for mongo to search
    for(let prop in searchParams) {
        query[searchParams[prop]] = {$regex: req.query[searchParams[prop]], $options: 'i'}
    }

    let illustrations = await Illustration.find(query).exec();
    
    if (!illustrations.length) {
        res.status(404).json({ success: false, error: `No illustrations found.` });
        return next();
    }
    res.status(200).json(illustrations);
    next();
}

getIllustrationById = async (req, res, next) => {
    Illustration.findOne({ _id: req.params.id }, (err, illustration) => {
            // If we failed the lookup, just get out of there
            if(err) {
                res.status(400).json({
                    success: false,
                    error: 'Failed to find illustration',
                });
                return next();
            }
    
            // If the user is already created, just move on
            if(!illustration) {
                res.status(404).json({
                    success: false,
                    error: 'No illustration found with id ' + req.params.id,
                });
                return next();
            }
    
            res.status(200).json(illustration);
            next();
        });
}

getTopTenIllustrations = async (req, res, next) => {
    Illustration.find({
        featured: { $ne: null },
        original: { $ne: null },
    }).sort({featured: 'desc'}).limit(10).exec((err, illustrations) => {
        if (err) {
            res.status(400).json({ success: false, error: err });
            return next();
        }
        if (!illustrations.length) {
            res.status(404).json({ success: false, error: `Illustrations not found` });
            return next();
        }

        // Truncate the illustration body for each of the top ten, so that they can't cheat to read them anyways
        for(let i = 0; i < illustrations.length; i++) {
            let ellipsis = (illustrations[i].body.length > 500);
            illustrations[i].body = illustrations[i].body.replace( /(<([^>]+)>)/ig, '').replace(/&nbsp;/ig, ' ').substring(0, 500);
            if (ellipsis) {
                illustrations[i].body += '...';
            }
        }

        res.status(200).json(illustrations);
        next();
    });
}

updateIllustration = async (req, res, next) => {
    // Let's just not mess around with possibly modifying ids...
    if(req.body._id) {
        delete req.body._id;
    }

    let updated = await Illustration.findOneAndUpdate({ _id: req.params.id }, req.body, {new: true});

    if(!updated) {
        res.status(404).json({
            success: false,
            info: 'Unable to update illustration ' + req.params.id,
        });
        return next();
    } else {
        res.status(200).json(updated);
        next();
    }
}

getUserIllustrations = async (req, res, next) => {
    let illustrations = await Illustration.find({ creator: req.user.sub }).exec();
    
    if (!illustrations) {
        res.status(500).json({ success: false, error: `Error retrieving your library.` });
        return next();
    }
    res.status(200).json(illustrations);

    // Using next() there will allow the routing to continue on and try to use 'library' as the id for the next matching route
    // next();
}

featureIllustration = async (req, res, next) => {
    if (!req.user.permissions || req.user.permissions.indexOf('administer:illustrations') < 0) {
        res.status(403).json({status: 'Forbidden', reason: 'You do not have adequate authority to perform this action.'});
        return;
    }

    let found = await Illustration.findOne({ _id: req.params.id });

    let foundCopy = found.toObject();
    foundCopy._id = mongoose.Types.ObjectId();

    let featuredIllustration = new Illustration(foundCopy);
    featuredIllustration.original = found._id;

    // Use the same date for both, to preserve their connection
    let featuredDate = new Date();

    featuredIllustration.featured = featuredDate;
    found.featured = featuredDate;

    let foundResult;
    let featuredResult;

    try {
        [foundResult, featuredResult] = await Promise.all([found.save(), featuredIllustration.save()]);
    } catch (err) {
        // TODO: SETUP REAL LOGGING. THIS IS PREPOSTEROUS.
        console.log(err);
    }
    
    res.status(200).json(foundResult);
}

module.exports = {
    createIllustration,
    deleteIllustration,
    getIllustrations,
    getIllustrationById,
    getTopTenIllustrations,
    updateIllustration,
    getUserIllustrations,
    featureIllustration,
};