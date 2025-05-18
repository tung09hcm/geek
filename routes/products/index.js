const express = require('express');
const router = express.Router();
const { getProductsByFilter } = require('../../controllers/products/index');

router.get('/search', getProductsByFilter);

module.exports = router;