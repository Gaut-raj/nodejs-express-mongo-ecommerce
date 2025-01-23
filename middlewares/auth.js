const Item = require('../models/itemModel');

exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are already logged in');
        return res.redirect('/users/profile');
    }
};

exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/users/login');
    }
};

exports.isSeller = (req, res, next) => {
    Item.findById(req.params.id)
        .then(item => {
            if (item) {
                if (item.seller.equals(req.session.user)) {
                    return next();
                } else {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return next(err);
                }
            } else {
                let err = new Error('Cannot find an item with id ' + req.params.id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};
