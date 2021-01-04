const Guide = require('../database/models/guide.model');

// Create a new Study Guide in the DB
createGuide = async (req, res) => {
    // Create the guide document (The model instance that will be saved to the DB)
    const newGuide = new Guide({...req.body, creator: req.user.sub});

    // Check if the document was actually instantiated
    if (!newGuide) {
        // Something was missing from the request object, so it could not be persisted
        return res.status(400).json({ success: false, message: 'Study Guide could not be created.' });
    }

    // Attempt to save the guide document to the database
    try {
        let result = await newGuide.save();

        return res.status(200).json({
            success: true,
            id: newGuide._id,
            message: 'Study Guide created!',
        });
    } catch (error) {
        console.log("Study Guide persistence failed. Details:");
        console.log(error);

        // we failed to save the document, ESCAPE
        return res.status(500).json({
            error,
            message: 'Study Guide not created!',
        });
    }
}

getGuideById = async (req, res) => {
    await Guide.findOne({ _id: req.params.id }).populate('sermon').exec((err, guide) => {
        // If we failed the lookup, just get out of there
        if(err) {
            return res.status(400).json({
                success: false,
                error: 'Failed to find study guide',
            });
        }

        // If the user is already created, just move on
        if(!guide) {
            return res.status(404).json({
                success: false,
                error: 'No study guide found with id ' + req.params.id,
            });
        }

        return res.status(200).json(guide)
    });
}

updateGuide = async (req, res) => {
    // Let's just not mess around with possibly modifying ids...
    if(req.body._id) {
        delete req.body._id;
    }

    let updated = await Guide.findOneAndUpdate({ _id: req.params.id }, req.body, {new: true});

    if(!updated) {
        return res.status(404).json({
            success: false,
            info: 'Unable to update guide ' + req.params.id,
        });
    } else {
        return res.status(200).json(updated);
    }
}

module.exports = {
    createGuide,
    getGuideById,
    updateGuide,
};