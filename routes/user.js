const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');

const userController = require('../controllers/users');
const { render } = require('ejs');

// Signup - GET Route
router.get("/signup", userController.renderSignupForm);

// Signup - POST Route
router.post("/signup", wrapAsync(userController.signup));

// Login - GET Route
router.get("/login", userController.renderLoginForm);

// Login - POST Route
router.post(
    "/login", 
    saveRedirectUrl,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }),
    userController.login
);

// Logout Route
router.get("/logout", userController.logout);


module.exports = router;