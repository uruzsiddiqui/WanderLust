let express = require('express');
let app = express();
let path = require('path');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
const Listing = require('./models/listing.js');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const port = 3000;

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

main()
.then(() => {
    console.log("Connection Established");
}).catch(() => {
    console.log("Error Occured");
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}

// const user1 = new Listing({
//     title: "villa",
//     description: "This is the best hotel",
//     price: 2000,
//     location: "goa",
//     country: "India"
// }) 

// user1.save()
// .then(() => {
//     console.log("Saved")
// }).catch((err) => {
//     console.log("Error Found");
// })

//Function mai define kr rha hu Joi se Schema Validation
let validateSchema = (req, res, next) => {
    let{ error } = listingSchema.validate(req.body);
    if(error){
        let err = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, err);
    } else {
        next();
    }
}

let validateReview = (req, res, next) => {
    let{ error } = reviewSchema.validate(req.body);
    if(error){
        let err = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, err);
    } else {
        next();
    }
}

//Basic Route
app.get("/", (req, res) => {
    res.send("Hey i am root");  
})

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
//is route ko upr likhna pdega app.get("/listings/:id",  
// is route ke vrna ye new ko ek variable smj rha hai
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

//Get Request for change the content (Then send the put request)
app.get( "/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Create Route
// app.post("/listings", async (req, res) => {

    //Old way to add the data in database
    
    // let {title, description, image, price, country, location} = req.body;
    // let obj1 = {
    //     title: title,
    //     description: description,
    //     image: image,
    //     price: price,
    //     country: country,
    //     location: location,
    // }

    // Ye same rhega old mai and new mai bhi

    // let newListing = new Listing(obj1);
    // newListing.save()
    // .then((res) => {
    //     console.log("Data Saved")
    // }).catch((err) => {
    //     console.log("Data was not saved", err);
    // })

//     let newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings")
// });

app.post("/listings",
      validateSchema,
      wrapAsync(async (req, res, next) => {
        // let result = listingSchema.validate(req.body);
        // if(result.error){
        //     throw new ExpressError(400, result.error);
        // }
        let newListing = new Listing(req.body.listing);
         await newListing.save();
         res.redirect("/listings")
}));

//post route for Reviews

app.post("/listings/:id/reviews", validateReview , wrapAsync(async (req, res) => {
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

//Put request to change the data 
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    // console.log({...req.body.listing})
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`)
}));

//delete the data from database
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//delete the review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))


//If the Routes didn't match with above routes then it come in this route
// app.all("/:pathMatch(*)", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });

// Kisi string string syntax ki zaroorat nahi, yeh har request ko catch karega
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

//Error Handle Middleware
app.use((err, req, res, next) => {
    let {status=500, message="Something went wrong"} = err;
    // res.status(status).send(message);
    res.render("listings/error.ejs", {err})
})

app.listen(port, () => {
    console.log(`Port is running on ${port}`);
});