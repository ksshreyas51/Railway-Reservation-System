const express = require('express');
const { searchTrains } = require('../controllers/train.controller');
const router = express.Router();

router.get('/search', searchTrains);

module.exports = router;
