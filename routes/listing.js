let express = require('express');
let router = express.Router();
const { listingSchema } = require("./../schema.js");
const Listing = require('./../models/listing.js');
const wrapAsync = require("./../utils/wrapAsync.js");
const ExpressError = require("./../utils/ExpressError.js")

let validateSchema = (req, res, next) => {
    let{ error } = listingSchema.validate(req.body);
    if(error){
        let err = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, err);
    } else {
        next();
    }
}

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
//is route ko upr likhna pdega app.get("/listings/:id",  
// is route ke vrna ye new ko ek variable smj rha hai
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

//Get Request for change the content (Then send the put request)
router.get( "/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

router.post("/",
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

router.put("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    // console.log({...req.body.listing})
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`)
}));

//delete the data from database
router.delete("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
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


module.exports = router;