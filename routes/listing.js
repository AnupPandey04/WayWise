const express=require('express');
const router=express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const {listingSchema} = require('../schema.js');
const Listing=require('../models/listing');
const ExpressError = require('../utils/ExpressError'); 


const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//Index Route
router.get("",async(req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });
});

// New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    res.render("listings/show.ejs", { listing });
    console.log(listing.reviews);
});


// Create Route
router.post("/", wrapAsync(async (req, res, next) => {
        let { title, description, price, location, country } = req.body;
        let newListing = new Listing({
        title,
        description,
        price,
        location,
        country
        });
        await newListing.save();
        req.flash('success', 'Successfully created a new listing!');
        res.redirect("/listings");
    }));


// Edit Route
router.get("/:id/edit", async (req, res) => {
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

// Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
  res.redirect(`/listings/${updatedListing._id}`);
}));


// Delete Route
router.delete("/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", deletedListing);
    res.redirect("/listings");
});

module.exports=router;