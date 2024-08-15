const express = require('express');
const router = express.Router();
const { searchController } = require('../controllers/searchController');

router.get('/search', searchController);

module.exports = router;
