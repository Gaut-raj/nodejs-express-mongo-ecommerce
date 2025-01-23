const {body} = require('express-validator');
exports.validateId = (req, res, next) => {
    const id = req.params.id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);  

    if (isValidObjectId) {
        next();
    } else {
        const err = new Error('Invalid ID format');
        err.status = 400;
        next(err);
    }
};

exports.validateSignUp = [body('firstName', 'first name cannot be empty').notEmpty().trim().escape() ,
    body('lastName', 'last name cannot be empty').notEmpty().trim().escape(), 
    body('email','email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password','Password must be at least 8 characters and 64 characters at most').isLength({min: 8, max: 64})
];

exports.validateLogin = [body('email', 'email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
    body('password', 'Password must be at least 8 characters and 64 characters at most').isLength({min: 8, max: 64})
    ]; 

exports.validateItem = [body('condition', 'condition must be one of the values listed').isIn(['new', 'like-new', 'good','fair', 'acceptable']),
    body('price', 'Price must be a valid amount').isCurrency(), 
    body('offer', 'Offer must be a valid currency').isCurrency()];


exports.validateOffer = [body('amount', 'amount should not be empty').trim().escape()];