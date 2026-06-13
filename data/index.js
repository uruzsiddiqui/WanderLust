let express = require('express');
let mongoose = require('mongoose');
let initData = require('./init.js');
let Listing = require('./../models/listing.js');

const url = "mongodb://127.0.0.1:27017/wanderlust"

main()
.then(async (res) => {
    console.log("Connection working");
}) .catch((err) => {
    console.log("Error --Found", err);
})

async function main() {
   await mongoose.connect(url);
}

const initDB = async () => {
//    await Listing.deleteMany({});
    //    await Listing.insertMany(initData.sampleListings)
    let allListing = initData.sampleListings.map((obj) => ({
        ...obj,
        image: obj.image ?  obj.image.url : " "
    }));
    await Listing.insertMany(allListing);
}

initDB();


// let express = require('express');
// let mongoose = require('mongoose');
// let initData = require('./init.js');
// let Listing = require('./../models/listing.js');

// const url = "mongodb://127.0.0.1:27017/wanderlust";

// main()
// .then(() => {
//     console.log("Connection working");
//     initDB(); // Connection sahi hone par hi data dalna chahiye
// }) 
// .catch((err) => {
//     console.log("Error --Found", err);
// });

// async function main() {
//    await mongoose.connect(url);
// }

// const initDB = async () => {
//     try {
//         // ⬇️ Pehle purana kharab data delete karein (comment hata diya hai)
//         await Listing.deleteMany({});
        
//         // ⬇️ Yeh jadu hai! Yeh object se url nikal kar string bana dega bina aapka data badle
//         // const cleanedListings = initData.sampleListings.map((obj) => ({
//         //     ...obj,
//         //     image: obj.image ? obj.image.url : ""
//         // }));

//         // await Listing.insertMany(cleanedListings);
//         // console.log("Data insert ho gaya!");
//     } catch(err) {
//         console.log("Insertion error:", err);
//     }
// };