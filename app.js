const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Listing=require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const {listingSchema} = require('./schema.js');


const MONGO_URL="mongodb://127.0.0.1:27017/waywise";

main()
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));    

app.get("/",(req,res)=>{
    res.send("Hi, This is root");
});

const validateListing = (req, res, next) => {
    let {error}=listingSchema.validate(req.body);
    if (error) {
        let msg = error.details.map(el => el.message).join(',');
        throw new Error(msg);
    } else {
        next();
    }
};


//Index Route
app.get("/listings",validateListing,async(req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });
});

// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});


// Create Route
app.post("/listings", wrapAsync(async (req, res, next) => {
        let { title, description, price, location, country } = req.body;
        let newListing = new Listing({
        title,
        description,
        price,
        location,
        country
        });
        await newListing.save();
        res.redirect("/listings");
    }));


// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

// Update Route
app.put("/listings/:id", validateListing, async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body }, { new: true });
    res.redirect(`/listings/${id}`);
});

// Delete Route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", deletedListing);
    res.redirect("/listings");
});

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title: "My New Villa",
//         description: "By the sea",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });
//     await sampleListing.save();
//     console.log("Sample listing saved");
//     res.send("Successfull testing");
// });

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).render("error.ejs", { message: "Page Not Found", statusCode: 404 });
});

// Global Error Handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);
});

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});