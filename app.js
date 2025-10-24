const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash= require('connect-flash');

const listings= require('./routes/listing.js');
const reviews= require('./routes/review.js');

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

// Using express-session
const sessionOptions={
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge : 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};

app.get("/",(req,res)=>{
    res.send("Hi, This is root");
});

app.use(session(sessionOptions));
app.use(flash());

// Flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    console.log(res.locals.success);
    next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


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