let express = require('express');
let router = express.Router({mergeParams: true});
const { reviewSchema } = require("./../schema.js");
const Review = require("./../models/review.js");
const wrapAsync = require("./../utils/wrapAsync.js");
const Listing = require('./../models/listing.js');
const ExpressError = require('./../utils/ExpressError.js')

let validateReview = (req, res, next) => {
    let{ error } = reviewSchema.validate(req.body);
    if(error){
        let err = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, err);
    } else {
        next();
    }
}

router.post("/", validateReview , wrapAsync(async (req, res) => {
    let {id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review)
    let result = listing.reviews.push(newReview);

    await listing.save()
    await newReview.save();

    console.log("New Review Saved");
    // res.send("New Review Send ");

    res.redirect(`/listings/${listing._id}`);
}));

//delete the review
router.delete("/:reviewId", wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))


module.exports = router;