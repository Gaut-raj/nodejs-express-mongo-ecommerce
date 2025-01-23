const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const offerRoutes = require('./offerRoutes');
const { isLoggedIn, isSeller } = require('../middlewares/auth');
const { validateId, validateItem } = require('../middlewares/validator'); 
router.get('/', itemController.index);

// Create a new item
router.get('/new', isLoggedIn, itemController.new);

// POST a new Item 
router.post('/', isLoggedIn, validateItem, itemController.create);

// Show item 
router.get('/:id', validateId, itemController.show);

// Edit an item 
router.get('/:id/edit', validateId, isLoggedIn, isSeller, itemController.edit);

// Update an item 
router.put('/:id', validateId, validateItem, isLoggedIn, isSeller, itemController.update);

// Delete an item 
router.delete('/:id', validateId, isLoggedIn, isSeller, itemController.delete);

// Mount offerRoutes for routes starting with /items/:id/offers
router.use('/:id/offers', offerRoutes);

module.exports = router;
