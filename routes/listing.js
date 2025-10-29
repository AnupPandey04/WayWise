const express=require('express');
const router=express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing=require('../models/listing');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingsController = require('../controllers/listings');
const multer  = require('multer')
const {storage} = require('../cloudConfig.js');
const upload = multer({ storage });

// Index and Create Route
router.route("/")
  .get(wrapAsync(listingsController.index))
  .post(isLoggedIn, upload.single('image'), validateListing, wrapAsync(listingsController.createListing));

// New Route
router.get("/new", isLoggedIn, listingsController.renderNewForm);

// Show, Update and Delete Route
router.route("/:id")
  .get(wrapAsync(listingsController.showListing))
  .put(isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(listingsController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm));


module.exports=router;