const express = require('express');
const router = express.Router();

const {getAllCategories, getAllProductsByCategory} = require('../../controllers/category/index');
router.get('/', getAllCategories);
router.get('/:id/products', getAllProductsByCategory);

module.exports = router;