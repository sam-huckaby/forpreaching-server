const express = require('express');
// const jwtAuthz = require('express-jwt-authz');

// Use this to check the scopes available on the user's token, so we can scope individual routes
//const checkScopes = jwtAuthz([ 'read:messages' ]);

const SermonCtrl = require('../controllers/sermon.controller');

const router = express.Router();

// Interact with sermons in general
router.get('/', SermonCtrl.getSermons);
router.post('/', SermonCtrl.createSermon);

// This needs to be before the /:id route otherwise it gets caught there
// Get user-level sermons
router.get('/library', SermonCtrl.getUserSermons);

// Interact with specific sermons
router.post('/:id/comments', SermonCtrl.appendComment);
router.get('/:id', SermonCtrl.getSermonById);
router.put('/:id', SermonCtrl.updateSermon);
router.delete('/:id', SermonCtrl.deleteSermon);

module.exports = router;