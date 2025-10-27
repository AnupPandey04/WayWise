const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const Review = require('../models/review');
const Listing=require('../models/listing');
const mongoose = require('mongoose');
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');

const reviewController = require('../controllers/reviews');

// Reviews-POST Route
router.post("/", isLoggedIn, validateReview ,wrapAsync(reviewController.createReview));

//Reviews-DELETE Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;