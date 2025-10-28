const Listing = require('../models/listing');

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

module.exports.createListing= async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const { title, description, price, location, country } = req.body.listing;

    let newListing = new Listing({
    title,
    description,
    price,
    location,
    country
    });

    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash('success', 'Successfully created a new listing!');
    res.redirect("/listings");
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
    
    // Destructure from req.body.listing (nested structure)
    const { title, description, price, location, country } = req.body.listing;

    // First updating the basic fields
    await Listing.findByIdAndUpdate(id, { 
        title, 
        description, 
        price, 
        location, 
        country 
    });

    // Then handling image update if a new file was uploaded
    if(req.file){
        let url = req.file.path;
        let filename = req.file.filename;
        
        // Updating the image field directly in the database
        await Listing.findByIdAndUpdate(id, {
            image: { url, filename }
        });
    }
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing= async (req, res) => {
    let { id } = req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect("/listings");
};