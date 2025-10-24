const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const {reviewSchema} = require('../schema.js');
const Review = require('../models/review');
const Listing=require('../models/listing');
const mongoose = require('mongoose');


const validateReview = (req, res, next) => {
    // Wrap req.body in { review } if it doesn’t exist
    const dataToValidate = req.body.review ? req.body : { review: req.body };

    const { error } = reviewSchema.validate(dataToValidate);
    if (error) {
        let msg = error.details.map(el => el.message).join(', ');
        throw new Error(msg);
    } else {
        next();
    }
};

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

    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
}));

//Reviews-DELETE Route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, { 
        $pull: { reviews: new mongoose.Types.ObjectId(reviewId) } 
    });
    
    await Review.findByIdAndDelete(reviewId);
    
    res.redirect(`/listings/${id}`);
}));

module.exports = router;