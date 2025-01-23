const User = require('../models/user');
const Item = require('../models/itemModel');
const Offer = require('../models/offer');
// Render the sign-up form
exports.new = (req, res) => {
    res.render('./user/new');
};

// Create a new user
exports.create = (req, res, next) => {
    let user = new User(req.body);
    user.save()
        .then(user => {
            req.flash('success', 'You have successfully registered');
            res.redirect('/users/login');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('/users/new');
            }
            if (err.code === 11000) {
                req.flash('error', 'Email has been used');
                return res.redirect('/users/new');
            }
            next(err);
        });
};


// Render the login form
exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
};

// Handle user login
exports.login = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'wrong email address');
                res.redirect('/users/login');
            } else {
                user.comparePassword(password)
                    .then(result => {
                        if (result) {
                            req.session.user = user._id;
                            req.flash('success', 'You have successfully logged in');
                            res.redirect('/users/profile');
                        } else {
                            req.flash('error', 'wrong password');
                            res.redirect('/users/login');
                        }
                    });
            }
        })
        .catch(err => next(err));
};

// Display user profile with items they listed
exports.profile = (req, res, next) => {
    let userId = req.session.user;

    Promise.all([
        User.findById(userId), 
        Item.find({ seller: userId }), 
        Offer.find({ user: userId }).populate('item', 'title') 
    ])
        .then(results => {
            const [user, items, offers] = results; 
            res.render('./user/profile', { user, items, offers }); 
        })
        .catch(err => next(err));
};

// Handle user logout
exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.redirect('/');
    });
};
