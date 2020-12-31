const express = require('express');

const IllustrationCtrl = require('../controllers/illustration.controller');
const StaticCtrl = require('../controllers/static.controller');

const router = express.Router();

router.get('/topten', IllustrationCtrl.getTopTenIllustrations);

router.get('/logo', StaticCtrl.getLogo);

module.exports = router;