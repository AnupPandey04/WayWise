const Joi=require("joi"); //for server-side validation
const review = require("./models/review");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
        category: Joi.string()
            .valid(
                "Trending",
                "Rooms",
                "Iconic Cities",
                "Mountains",
                "Castles",
                "Amazing Pools",
                "Camping",
                "Farms",
                "Arctic",
                "Domes",
                "Boats"
            )
            .required(),
        // image: Joi.string().required()
    }).required()
});

module.exports.reviewSchema=Joi.object({
    rating:Joi.number().required(),
    comment:Joi.string().required()
});