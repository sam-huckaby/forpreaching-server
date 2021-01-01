const express = require('express');

const IllustrationCtrl = require('../controllers/illustration.controller');
const SermonCtrl = require('../controllers/sermon.controller');
const StaticCtrl = require('../controllers/static.controller');

const router = express.Router();

router.get('/topten/illustrations', IllustrationCtrl.getTopTenIllustrations);
router.get('/topten/sermons', SermonCtrl.getTopTenSermons);

router.get('/logo', StaticCtrl.getLogo);

module.exports = router;