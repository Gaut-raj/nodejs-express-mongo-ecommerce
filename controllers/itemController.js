const itemModel = require('../models/itemModel');
const multer = require('multer');
const path = require('path');
const offer = require('../models/offer')
// Setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (mimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only jpg, jpeg, png, and gif image files are allowed'), false);
    }
};

exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
}).single('image');

// List all items
exports.index = (req, res, next) => {
    let query = req.query.q ? req.query.q.toLowerCase() : '';

    itemModel.find()
        .then(items => {
            if (query) {
                const filteredItems = items.filter(item =>
                    item.active && 
                    (item.title && item.title.toLowerCase().includes(query)) || 
                    (item.details && item.details.toLowerCase().includes(query))
                );
                res.render('./store/items', {
                    items: filteredItems,
                    message: filteredItems.length > 0 ? null : 'No items match your search criteria'
                });
            } else {
                items.sort((a, b) => a.price - b.price);
                res.render('./store/items', { items, message: null });
            }
        })
        .catch(err => next(err));
};

// Show individual item details
exports.show = (req, res, next) => {
    itemModel.findById(req.params.id).populate('seller', 'firstName lastName')
        .then(item => {
            if (item) {
                console.log(item);
                return res.render('./store/item', { item });
            } else {
                let err = new Error('Cannot find an item with id ' + req.params.id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

// Render form to create a new item
exports.new = (req, res) => {
    res.render('./store/new');
};

// Create a new item
exports.create = [
    exports.upload, // Middleware for handling file uploads (e.g., multer)
    (req, res, next) => {
        // Log incoming request body and file data for debugging
        console.log('Request Body:', req.body);
        console.log('Uploaded File:', req.file);

        // Prepare the new item data
        const newItem = new itemModel({
            title: req.body.title,
            seller: req.session.user, // Ensure the user is logged in
            condition: req.body.condition,
            price: req.body.price,
            details: req.body.details,
            image: req.file ? req.file.filename : 'default-image.jpg', // Handle missing file
            active: true
        });

        // Save the new item to the database
        newItem.save()
            .then(() => {
                req.flash('success', 'Item created successfully');
                res.redirect('/items'); // Redirect to items list or dashboard
            })
            .catch(err => {
                if (err.name === 'ValidationError') {
                    // Log validation errors for debugging
                    console.error('Validation Error Details:', err.errors);
                    req.flash('error', 'Validation failed. Please check your input.');
                    res.status(400).redirect('/items/new'); // Redirect back to the creation form
                } else {
                    console.error('Unexpected Error:', err);
                    req.flash('error', 'An error occurred while creating the item.');
                    next(err); // Pass to the error-handling middleware
                }
            });
    }
];

// Render edit form for an item
exports.edit = (req, res, next) => {
    itemModel.findById(req.params.id)
        .then(item => {
            if (item) {
                res.render('./store/edit', { item });
            } else {
                let err = new Error('Cannot find an item with id ' + req.params.id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

// Update an item
exports.update = [
    exports.upload,
    (req, res, next) => {
        itemModel.findById(req.params.id)
            .then(item => {
                if (!item) {
                    let err = new Error('Cannot find an item with id ' + req.params.id);
                    err.status = 404;
                    return next(err);
                }

                let updatedItem = {
                    title: req.body.title,
                    seller: req.body.seller,
                    condition: req.body.condition,
                    price: req.body.price,
                    details: req.body.details,
                    image: req.file ? req.file.filename : item.image,
                };

                itemModel.findByIdAndUpdate(req.params.id, updatedItem, { useFindAndModify: false, runValidators: true })
                    .then(() => {
                        req.flash('success', 'Item updated successfully');
                        res.redirect(`/items/${req.params.id}`);
                    })
                    .catch(err => {
                        if (err.name === 'ValidationError') {
                            req.flash('error', 'Validation failed. Please check your input.');
                            res.status(400).redirect(`/items/${req.params.id}/edit`);
                        } else {
                            req.flash('error', 'An error occurred while updating the item.');
                            next(err);
                        }
                    });
            })
            .catch(err => next(err));
    }
];

// Delete an item
exports.delete = (req, res, next) => {
    const itemId = req.params.id;

    
    itemModel.findById(itemId)
        .then(item => {
            if (!item) {
                req.flash('error', 'Cannot find the item to delete');
                return res.status(404).redirect('/items');
            }

            return offer.deleteMany({ item: itemId })
                .then(() => {
                   
                    return itemModel.findByIdAndDelete(itemId);
                })
                .then(() => {
                    req.flash('success', 'Item and associated offers deleted successfully');
                    res.redirect('/items');
                });
        })
        .catch(err => {
            req.flash('error', 'An error occurred while deleting the item');
            next(err);
        });
};

