const express = require('express');
// const jwtAuthz = require('express-jwt-authz');

// Use this to check the scopes available on the user's token, so we can scope individual routes
//const checkScopes = jwtAuthz([ 'read:messages' ]);

const IllustrationCtrl = require('../controllers/illustration.controller');

const router = express.Router();

// Interact with illustrations in general
router.get('/', IllustrationCtrl.getIllustrations);
router.post('/', IllustrationCtrl.createIllustration);

// This needs to be before the /:id route otherwise it gets caught there
// Get user-level illustrations
router.get('/library', IllustrationCtrl.getUserIllustrations);

// Interact with specific illustrations
router.get('/:id', IllustrationCtrl.getIllustrationById);
router.put('/:id', IllustrationCtrl.updateIllustration);
router.delete('/:id', IllustrationCtrl.deleteIllustration);

module.exports = router;