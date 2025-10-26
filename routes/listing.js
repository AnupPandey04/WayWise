const express=require('express');
const router=express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing=require('../models/listing');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');


//Index Route
router.get("",async(req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });
});

// New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path : 'reviews',
        populate: {
          path : 'author',
        },
      })
      .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  })
);


// Create Route
router.post("/", isLoggedIn, wrapAsync(async (req, res, next) => {
        let { title, description, price, location, country } = req.body;
        let newListing = new Listing({
        title,
        description,
        price,
        location,
        country
        });
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash('success', 'Successfully created a new listing!');
        res.redirect("/listings");
    }));


// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, async (req, res) => {
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
});

// Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash('success', 'Listing Updated!');
  res.redirect(`/listings/${id}`);
}));


// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect("/listings");
  })
);

module.exports=router;