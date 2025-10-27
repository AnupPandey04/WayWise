const Listing = require('../models/listing');
const Review = require('../models/review');
const mongoose = require('mongoose');

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    const newReview = new Review({
        rating: req.body.rating,
        comment: req.body.comment
    });
    newReview.author = req.user._id;
    listing.reviews.push(newReview._id);

    await newReview.save();
    await listing.save();
    req.flash('success', 'New Review Created!');
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, { 
        $pull: { reviews: new mongoose.Types.ObjectId(reviewId) } 
    });
    
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted!');
    res.redirect(`/listings/${id}`);
};