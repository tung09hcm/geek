const express = require('express');
const router = express.Router();
const {addOrder} = require('../../controllers/order/index');

router.post('/', addOrder);
router.post('/:id/send-confirmation');
module.exports = router;