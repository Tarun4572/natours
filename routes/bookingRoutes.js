const express = require('express');
const { getCheckoutSession } = require('./../controllers/bookingController');
const { protect } = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.get('/checkout-session/:tourId', protect, getCheckoutSession);

module.exports = router;
