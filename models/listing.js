const mongoose=require('mongoose');
const review = require('./review');
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: String,
        url: String,
      },
    price: Number,
    location: String,
    country: String,
    reviews: [
        { type: Schema.Types.ObjectId, ref: "Review" }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});

listingSchema.post('findOneAndDelete', async function(listing) {
    if(listing.reviews.length){
        let res=await review.deleteMany({_id:{$in:listing.reviews}});
        console.log(res);
    }
});

const Listing=mongoose.model('Listing',listingSchema);
module.exports=Listing;