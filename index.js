let express = require('express');
let app = express();
let path = require('path');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js")
const reviews = require("./routes/review.js")

const port = 3000;

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use("/listings", listings);
app.use("/listings/:id/reviews/", reviews);

main()
.then(() => {
    console.log("Connection Established");
}).catch(() => {
    console.log("Error Occured");
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}

//Basic Route
app.get("/", (req, res) => {
    res.send("Hey i am root");  
})

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

//post route for Reviews

//Put request to change the data 


//If the Routes didn't match with above routes then it come in this route
// app.all("/:pathMatch(*)", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });

