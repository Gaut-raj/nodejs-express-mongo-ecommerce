const express = require('express');
const controller = require('../controllers/userController');
const router = express.Router(); 
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const {validateLogin, validateSignUp} = require('../middlewares/validator');
// GET /users/new: send HTML form for creating a new user account
router.get('/new',  isGuest, controller.new);

// POST /users: create a new user account
router.post('/',   validateSignUp, isGuest,controller.create);

// GET /users/login: send HTML form for logging in
router.get('/login', isGuest, controller.getUserLogin);

// POST /users/login: authenticate user's login
router.post('/login', validateLogin, isGuest, controller.login);

// GET /users/profile: send user's profile page
router.get('/profile', isLoggedIn, controller.profile);

// POST /users/logout: log out a user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
