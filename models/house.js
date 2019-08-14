const mongoose = require('mongoose');



// Schema Setup
var houseSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    bedrooms: Number,
    beds: Number,
    bathrooms: Number,
    location: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        firstName: String,
        lastName: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("House", houseSchema);