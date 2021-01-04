const express = require('express');
const router = express.Router();

const GuideCtrl = require('../controllers/guide.controller');

// Interact with guides in general
router.post('/', GuideCtrl.createGuide);

// Interact with specific guides
router.get('/:id', GuideCtrl.getGuideById);
router.put('/:id', GuideCtrl.updateGuide);

module.exports = router;