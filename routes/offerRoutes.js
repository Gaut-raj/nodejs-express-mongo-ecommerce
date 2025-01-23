const express = require('express');
const controller = require('../controllers/offerController');
const router = express.Router({ mergeParams: true }); 
const { isLoggedIn, isSeller } = require('../middlewares/auth');
const {validateOffer} = require('../middlewares/validator');

// POST /items/:itemId/offers: make an offer on an item
router.post('/', isLoggedIn, validateOffer, controller.makeOffer);

// GET /items/:itemId/offers: view all offers received for an item
router.get('/', isLoggedIn, isSeller, controller.viewOffers);


// PUT /items/:itemId/offers/:offerId/accept: accept an offer for an item
router.put('/:offerId/accept',  isLoggedIn, isSeller, controller.acceptOffer);

module.exports = router;
