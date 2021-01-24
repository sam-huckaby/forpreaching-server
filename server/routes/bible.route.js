const express = require('express');
const router = express.Router();

const BibleCtrl = require('../controllers/bible.controller');

// Interact with guides in general
router.get('/books', BibleCtrl.retrieveBibleMeta);

module.exports = router;