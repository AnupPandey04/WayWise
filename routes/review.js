const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const Review = require('../models/review');
const Listing=require('../models/listing');
const mongoose = require('mongoose');
const ExpressError = require('../utils/ExpressError');
const { validateReview } = require('../middleware.js');


// Reviews-POST Route
router.post("/", validateReview ,wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    const newReview = new Review({
        rating: req.body.rating,
        comment: req.body.comment
    });

    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    req.flash('success', 'New Review Created!');
    res.redirect(`/listings/${listing._id}`);
}));

//Reviews-DELETE Route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, { 
        $pull: { reviews: new mongoose.Types.ObjectId(reviewId) } 
    });
    
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted!');
    res.redirect(`/listings/${id}`);
}));

module.exports = router;