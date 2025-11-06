const Listing = require('../models/listing');
const maptilerClient = require('@maptiler/client');
const { cloudinary } = require('../cloudConfig.js');

// Configure MapTiler
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index= async(req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm= (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing= async(req,res)=>{
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
};

module.exports.createListing = async (req, res, next) => {
    try {
        // Validating required file upload
        if (!req.file) {
            req.flash('error', 'Please upload an image for your listing.');
            return res.redirect('/listings/new');
        }

        let response = await maptilerClient.geocoding.forward(req.body.listing.location);
        
        // Validating geocoding response
        if (!response.features || response.features.length === 0) {
            req.flash('error', 'Invalid location provided. Please enter a valid location.');
            return res.redirect('/listings/new');
        }
        
        let url = req.file.path;
        let filename = req.file.filename;
        const { title, description, price, location, country, category } = req.body.listing;

        let newListing = new Listing({
            title,
            description,
            price,
            location,
            country,
            category
        });

        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = response.features[0].geometry;
        
        await newListing.save();
        req.flash('success', 'Successfully created a new listing!');
        res.redirect("/listings");
    } catch (error) {
        req.flash('error', 'Failed to create listing. Please try again.');
        console.error('Create listing error:', error);
        res.redirect('/listings/new');
    }
};

module.exports.renderEditForm= async (req, res) => {
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace('/upload', '/upload/w_250');
    res.render("listings/edit.ejs", { listing , originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, location, country, category } = req.body.listing;

    // Finding the existing listing first
    const existingListing = await Listing.findById(id);
    if (!existingListing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }

    // Creating update object
    const updateData = { 
        title, 
        description, 
        price, 
        location, 
        country, 
        category 
    };

    // Checking if location changed - if so, updating geocoding
    if (location && location !== existingListing.location) {
        let response = await maptilerClient.geocoding.forward(location);
            
        if (!response.features || response.features.length === 0) {
            req.flash('error', 'Invalid location provided. Please enter a valid location.');
            return res.redirect(`/listings/${id}/edit`);
        }
            
        updateData.geometry = response.features[0].geometry;
    }

    // Adds image to the same update object if file exists
    if(req.file){
        // deleting old image from cloudinary if exists
        if (existingListing.image && existingListing.image.filename) {
            try {
                await cloudinary.uploader.destroy(existingListing.image.filename);
            } catch (err) {
                console.error("Could not delete old cloudinary image:", err);
            }
        }
        updateData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    
    await Listing.findByIdAndUpdate(id, updateData);
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing= async (req, res) => {
    let { id } = req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
     // deleting cloudinary image if exists
    if (deletedListing.image && deletedListing.image.filename) {
      try {
        await cloudinary.uploader.destroy(deletedListing.image.filename);
      } catch (err) {
        console.error('Cloudinary delete failed for listing:', err);
      }
    }
    console.log("Deleted Listing:", deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect("/listings");
};


module.exports.filterByCategory = async (req, res) => {
  const { category } = req.params;
  const allListings = await Listing.find({ category });
  res.render("listings/index", { allListings, category });
};
