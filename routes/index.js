var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongo = require('mongodb').ObjectId;
var dotenv = require('dotenv');
var unirest = require('unirest');
// var subdomain = require('express-subdomain');


// THIS IS THE GREAT SCHOOLS API REQUEST
router.get('/', function(req, res, next){
    var API_KEY = process.env.API_KEY
    // unirest.get('http://api.greatschools.org/school/tests/TX/1?key=' + API_KEY + '')
    unirest.get('http://api.greatschools.org/search/schools?key=' + API_KEY + '&state=TX&q=Burnet')
      .end(function (data) {
        var dat1 = data.body.split('>')
      console.log(dat1[14].charAt(0));
      })
  res.render('home');
})



var userFavs = require('monk')('localhost/userFavs')
var Favs = userFavs.get('favs');  

// to set up favorites on create account, do an insert to favorites, with _id: user email address
router.post('/', function(req, res, next){
  console.log(req.body.favorite);
  Favs.update({email: 'boristotle@hotmail.com' },
    { $push: { favorites: req.body.favorite } })
})



// QC DATABASE
var db = require('monk')('localhost/listings');
var listings = db.get('listings');

  
// get QC favorites with promises to render the listings on the page
router.get('/qcFavs', function(req, res, next){
  return Favs.find({})
    .then(function(favs){
    var rec = favs[0].favorites.map(function(r){
      return mongo.ObjectId(r);
    })
    return listings.find( { _id: { $in: rec } }, function(err, listing) {
      console.log('error', err)
      console.log('data', listing)
      res.render('qcFavs', {listings: listing} );
      // console.log(data) 
    }) 
  })
})

router.post('/removeFav', function(){

})





router.get('/listingsQC', function(req, res, next) {
   listings.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/QCListings Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 0; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');
  // console.log(listing);

listings.insert({
     address: listing[0],
     beds: listing[1],
     fireplace: listing[2],
     taxes: listing[3] || 'NA',
     acreage: listing[4] || 'NA',
     lotSize: listing[5],
     basement: listing[6],
     city: listing[7],
     county: listing[8],
     elemSchool: listing[9] || 'NA',
     highSchool: listing[10] || 'NA',
     listOffice: listings[11], 
     middleSchool: listing[12] || 'NA',
     priceSqft: listing[13],
     status: listing[14],
     state: listing[15],
     subdivision: listing[16],
     baths: listing[17],
     sqft: Number(listing[18]) || 0,
     yearBuilt: listing[19],
     zip: listing[20],
     price: Number(listing[21]),
     DOM: Number(listing[22]),
     garage: listing[23],
     remarks: listing[24] || 'NA',
     amenities: listing[25],
     MLS: listing[26],
     photoCount: listing[27],
     listOffice: listing[28]
     });
}
      res.send('hello');
  // res.redirect('/');
});
})
  
});



// THIS GETS THE QC SEARCH PAGE
router.get('/quadCities', function(req, res, next){
  listings.find({}, function(err, listing){
    res.render('searchPageQC', { title: 'QC Listings', listings: listing});
  })
})


// THIS IS THE POST ROUTE TO FOR THE QC HOME SEARCH
router.post('/searchQC', function(req, res, next){
  listings.find({ $query: {$and: [ 
  {$or: [ { city: req.body.city }, { city: req.body.city[0] }, { city: req.body.city[1] }, { city: req.body.city[2] }, { city: req.body.city[3] },
  { city: req.body.city[4] }, { city: req.body.city[5] }, { city: req.body.city[6] },
  { city: req.body.city[7] }, { city: req.body.city[8] }, { city: req.body.city[9] },
  { city: req.body.city[10] }, { city: req.body.city[11] }, { city: req.body.city[12] },
  { city: req.body.city[13] } ]}, 
  {price: {$gte: Number(req.body.minprice), $lte: Number(req.body.maxprice)}},
  {sqft: {$gte: Number(req.body.minsqft), $lte: Number(req.body.maxsqft)}}, 
  {beds: {$gte: req.body.bedsmin}},
  {garage: {$gte: req.body.garages}},
  {baths: {$gte: req.body.bathsmin}
}]}, $orderby: { price : Number(-1) }
   
}, { limit : 10, skip : 0}, function(err, listing){
  if (listing.length == 0) {
    res.render('searchResultsQC', {listings: listing});
  }

    res.render('searchResultsQC', {listings: listing});
  })
})


// THIS IS THE SHOW ROUTER FOR QC HOMES
router.get('/quadCities/:id', function(req, res, next){
  listings.findOne({_id: req.params.id}, function(err, listing){
    res.render('showQC', {theListing: listing})
  })
})





// NASHVILLE DATABASE
var db = require('monk')('localhost/listingsNashville');
var listingsNashville = db.get('listings');



router.get('/listingsNashville', function(req, res, next) {
   listingsNashville.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/nashvilleListings Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 0; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');

listingsNashville.insert({
     acreage: Number(listing[0]).toFixed(2) || 'NA',
     hoaFees: listing[1] || 0,
     county: listing[2],
     elemSchool: listing[3],
     garage: listing[4],
     garageDesc: listing[5],
     highSchool: listing[6],
     middleSchool: listing[7],
     price: Number(listing[8]),
     listOffice: listing[9],
     status: listing[10],
     lotSize: listings[11], 
     fireplace: listing[12],
     stories: listing[13],
     photoCount: listing[14],
     pool: listing[15],
     primaryPicUrl: listing[16],
     sqft: Number(listing[17]) || 0,
     state: listing[18],
     address: listing[19],
     subdivision: listing[20],
     taxes: listing[21] || 'NA',
     beds: listing[22],
     baths: listing[23],
     water: listing[24],
     waterfront: listing[25],
     yearBuilt: listing[26],
     zip: listing[27],
     city: listing[28],
     remarks: listing[29],
     amenities: listing[30],
     MLS: listing[31],
     priceSQFT: (Number(listing[8]) / Number(listing[17])).toFixed(2)
   });
}
 res.send('hello');
  // res.redirect('/');
  });
})

});


router.get('/nashville', function(req, res, next){
  listingsNashville.find({}, function(err, listing){
    res.render('searchPageNashville', { title: 'Nashville Listings', listings: listing});
  })
})

router.post('/searchNashville', function(req, res, next){
  listingsNashville.find({ $query: {$and: [ 
  {$or: [ { city: req.body.city }, { city: req.body.city[0] }, { city: req.body.city[1] }, { city: req.body.city[2] }, { city: req.body.city[3] },
  { city: req.body.city[4] }, { city: req.body.city[5] }, { city: req.body.city[6] },
  { city: req.body.city[7] }, { city: req.body.city[8] }, { city: req.body.city[9] },
  { city: req.body.city[10] }, { city: req.body.city[11] }, { city: req.body.city[12] },
  { city: req.body.city[13] }, { city: req.body.city[14] }, { city: req.body.city[15] } ]}, 
  {price: {$gte: Number(req.body.minprice), $lte: Number(req.body.maxprice)}},
  {sqft: {$gte: Number(req.body.minsqft), $lte: Number(req.body.maxsqft)}}, 
  {beds: {$gte: req.body.bedsmin}},
  {garage: {$gte: req.body.garages}},
  {stories: {$in: req.body.stories.split(',') } },
  {baths: {$gte: req.body.bathsmin}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
  if (listing.length == 0) {
    res.render('searchResultsNashville', {listings: listing});
  }

    res.render('searchResultsNashville', {listings: listing});
  })
})



// THIS IS THE SHOW ROUTER FOR NASHVILLE HOMES
router.get('/nashville/:id', function(req, res, next){
  listingsNashville.findOne({_id: req.params.id}, function(err, listing){
    res.render('showNashville', {theListing: listing})
  })
})




// COLLEGE STATION
var db = require('monk')('localhost/listingsCollegeStation');
var listingsCollegeStation = db.get('listings');



router.get('/listingsCollegeStation', function(req, res, next) {
   listingsCollegeStation.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/collegeStation Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 0; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');

listingsCollegeStation.insert({
     amenities: listing[0],
     // appxsqft: listing[1],
     baths: listing[2],
     beds: listing[3],
     city: listing[4],
     fireplace: listing[5],
     garage: listing[6],
     hoaTerm: listing[7],
     hoaFee: listing[8] ,
     listOffice: listing[9],
     price: Number(listing[10]),
     listContractDate: new Date(listing[11]).getTime(),
     acreage: Number(listing[12]).toFixed(2),
     photoCount: listing[13],
     zip: listing[14],
     schoolDistrict: listing[15],
     sqft: Number(listing[10]) / Number(listing[31]) || 0,
     state: listing[17],
     status: listing[18],
     streetName: listing[19],
     streetNumber: listing[20],
     streetSuffix: listing[21],
     subdivision: listing[22],
     yearBuilt: listing[23],
     MLS: listing[24],
     matrixID: listing[25],
     county: listing[26],
     lotSize: listing[27],
     stories: listing[28],
     lotDesc: listing[29],
     remarks: listing[30],
     priceSQFT: Number(listing[31]).toFixed(2)
   });
}
 res.send('hello');
  // res.redirect('/');
});
})

});



router.get('/collegeStation', function(req, res, next){
  listingsCollegeStation.find({}, function(err, listing){
    res.render('searchPageCS', { title: 'College Station Listings', listings: listing});
  })
})
  
router.post('/searchCS', function(req, res, next){
  listingsCollegeStation.find({ $query: {$and: [ 
  {$or: [ { city: req.body.city }, { city: req.body.city[0] }, { city: req.body.city[1] }, { city: req.body.city[2] }, { city: req.body.city[3] },
  { city: req.body.city[4] }, { city: req.body.city[5] }, { city: req.body.city[6] },
  { city: req.body.city[7] }, { city: req.body.city[8] }, { city: req.body.city[9] },
  { city: req.body.city[10] }, { city: req.body.city[11] }, { city: req.body.city[12] },
  { city: req.body.city[13] }, { city: req.body.city[14] }, { city: req.body.city[15] },
  { city: req.body.city[16] }, { city: req.body.city[17] }, { city: req.body.city[18] },
  { city: req.body.city[19] }, { city: req.body.city[20] }, { city: req.body.city[21] },
  { city: req.body.city[22] }, { city: req.body.city[23] }, { city: req.body.city[24] },
  { city: req.body.city[25] }, { city: req.body.city[26] }, { city: req.body.city[27] },
  { city: req.body.city[28] }, { city: req.body.city[29] }]}, 
  {price: {$gte: Number(req.body.minprice), $lte: Number(req.body.maxprice)}},
  {sqft: {$gte: Number(req.body.minsqft), $lte: Number(req.body.maxsqft)}}, 
  {beds: {$gte: req.body.bedsmin}},
  {garage: { $in: req.body.garages.split(',') } },
  {stories: { $in: req.body.stories.split(',') } },
  {baths: {$gte: req.body.bathsmin}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
  // if (listing.length === 0) {
  //   res.render('searchResultsCS', {listings: listing});
  // }

    res.render('searchResultsCS', {listings: listing});
  })
})

// THIS IS THE SHOW ROUTER FOR COLLEGE STATION HOMES
router.get('/collegeStation/:id', function(req, res, next){
  listingsCollegeStation.findOne({_id: req.params.id}, function(err, listing){
    res.render('showCollegeStation', {theListing: listing})
  })
})




// AUSTIN
var db = require('monk')('localhost/listingsAustin'); 
var listingsAustin = db.get('listings');

// router.get('/newAustin', function(req, res, next){
//   res.render('newAustin');
// })

// THIS IS A POST REQUEST TO SEARCH BY SUBDIVISION
// router.post('/subdSearch', function(req, res, next){
//  listingsAustin.find({subdivision: {$regex: req.body.subdivision.charAt(0).toUpperCase() + req.body.subdivision.substring(1, req.body.subdivision.length)}}, function(err, listing){
//     res.render('searchResultsAustin', {listings: listing})
//   })
// })

router.get('/listingsAustin', function(req, res, next) {
   listingsAustin.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/AustinListings Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 0; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');

listingsAustin.insert({
     address: listing[0],
     taxes: listing[1] || 'NA',
     hoaFee: listing[2] || 0,
     hoaDuration: listing[3],
     baths: listing[4],
     beds: listing[5],
     city: listing[6],
     garage: listing[7],
     elemSchool: listing[8] ,
     // highSchool1: listing[9],
     middleSchool: listing[10],
     price: Number(listing[11]),
     masterMain: listing[12],
     fireplace: listing[13],
     photoCount: listing[14],
     pool: listing[15],
     zip: listing[16],
     remarks: listing[17] || 'NA',
     schoolDistrict: listing[18],
     highSchool: listing[19],
     spa: listing[20],
     sprinkler: listing[21],
     sqft: Number(listing[22]) || 0,
     state: listing[23],
     status: listing[24],
     stories: listing[25],
     subdivision: listing[26],
     taxAmt: listing[27],
     taxRate: Number(listing[28]).toFixed(2),
     waterfront: listing[29],
     yearBuilt: listing[30],
     county: listing[31],
     matrixID: listing[32],
     amenities: listing[33],
     listOffice: listing[34],
     view: listing[35],
     propSubtype: listing[36],
     HOA: listing[37],
     ListingContractDate: new Date(listing[38]).getTime(),
     rooms: listing[39],
     lotSize: Number(listing[40]).toFixed(2) || 'NA',
     priceSQFT: (Number(listing[11]) / Number(listing[22])).toFixed(2)
   });
}
 res.send('hello'); 
  // res.redirect('/');
});
})

});


router.get('/austin', function(req, res, next){
  listingsAustin.find({}, function(err, listing){
    res.render('searchPageAustin', { title: 'Austin Listings', listings: listing});
  })
})
  

router.post('/searchAustin', function(req, res, next){
  listingsAustin.find({ $query: {$and: [ 
  {$or: [ { city: req.body.city }, { city: req.body.city[0] }, { city: req.body.city[1] }, { city: req.body.city[2] }, { city: req.body.city[3] },
  { city: req.body.city[4] }, { city: req.body.city[5] }, { city: req.body.city[6] },
  { city: req.body.city[7] }, { city: req.body.city[8] }, { city: req.body.city[9] },
  { city: req.body.city[10] }, { city: req.body.city[11] }, { city: req.body.city[12] },
  { city: req.body.city[13] }, { city: req.body.city[14] }, { city: req.body.city[15] },
  { city: req.body.city[16] }, { city: req.body.city[17] }, { city: req.body.city[18] },
  { city: req.body.city[19] }, { city: req.body.city[20] }, { city: req.body.city[21] },
  { city: req.body.city[22] }, { city: req.body.city[23] }, { city: req.body.city[24] },
  { city: req.body.city[25] } ]}, 
  {price: {$gte: Number(req.body.minprice), $lte: Number(req.body.maxprice)}},
  {sqft: {$gte: Number(req.body.minsqft), $lte: Number(req.body.maxsqft)}}, 
  {beds: {$gte: req.body.bedsmin}},
  {garage: {$gte: req.body.garages}},
  {stories: {$in: req.body.stories.split(',') } },
  {baths: {$gte: req.body.bathsmin}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
  if (listing.length == 0) {
    res.render('searchResultsAustin', {listings: listing});
  }

    res.render('searchResultsAustin', {listings: listing});
  })
})


// THIS IS THE SHOW ROUTER FOR AUSTIN HOMES
router.get('/austin/:id', function(req, res, next){
  listingsAustin.findOne({_id: req.params.id}, function(err, listing){
    res.render('showAustin', {theListing: listing})
  })
})




// ORLANDO
var db = require('monk')('localhost/listingsOrlando');
var listingsOrlando = db.get('listings');



router.get('/listingsOrlando', function(req, res, next) {
  listingsOrlando.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/OrlandoListings Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 0; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');

listingsOrlando.insert({
     listDate: listing[0],
     address: listing[1],
     baths: Number(listing[2]).toFixed(0) || 'NA',
     beds: listing[3] || 'NA',
     amenities: listing[4],
     county: listing[5],
     price: Number(listing[6]),
     elemSchool: listing[7] || 'NA',
     fireplace: listing[8],
     stories: listing[9] || 1,
     garage: listing[10],
     hoaFee: listing[11] || 0,
     hoaDuration: listing[12],
     lotSize: listing[13] || '0.00',
     // acreage: listing[14],
     middleSchool: listing[15] || 'NA',
     matrixID: listing[16],
     MLS: listing[17],
     parking: listing[18],
     pool: listing[19],
     taxes: listing[20],
     yearBuilt: listing[21],
     listOffice: listing[22],
     highSchool: listing[23] || 'NA',
     status: listing[24],
     zip: listing[25],
     sqft: Number(listing[26]) || 0,
     subdivision: listing[27],
     city: listing[28],
     state: listing[29],
     remarks: listing[30],
     photoCount: listing[31],
     waterfront: listing[32],
     priceSQFT: (Number(listing[6]) / Number(listing[26])).toFixed(2),
     propType: listing[33]
   });
}
 res.send('hello');
  // res.redirect('/');
});
})

});


router.get('/orlando', function(req, res, next){
  listingsOrlando.find({}, function(err, listing){
    res.render('searchPageOrlando', { title: 'Orlando Listings', listings: listing});
  })
})
  

router.post('/searchOrlando', function(req, res, next){
  listingsOrlando.find({ $query: {$and: [ 
  {$or: [ { city: req.body.city }, { city: req.body.city[0] }, { city: req.body.city[1] }, { city: req.body.city[2] }, { city: req.body.city[3] },
  { city: req.body.city[4] }, { city: req.body.city[5] }, { city: req.body.city[6] },
  { city: req.body.city[7] }, { city: req.body.city[8] }, { city: req.body.city[9] },
  { city: req.body.city[10] }, { city: req.body.city[11] }, { city: req.body.city[12] },
  { city: req.body.city[13] }, { city: req.body.city[14] }, { city: req.body.city[15] },
  { city: req.body.city[16] }, { city: req.body.city[17] }, { city: req.body.city[18] },
  { city: req.body.city[19] }, { city: req.body.city[20] }, { city: req.body.city[21] },
  { city: req.body.city[22] }, { city: req.body.city[23] }, { city: req.body.city[24] },
   { city: req.body.city[25] }, { city: req.body.city[26] }, { city: req.body.city[27] },
  { city: req.body.city[28] }, { city: req.body.city[29] }, { city: req.body.city[30] },
  { city: req.body.city[31] }, { city: req.body.city[32] }, { city: req.body.city[33] },
  { city: req.body.city[34] }, { city: req.body.city[35] }, { city: req.body.city[36] },
  { city: req.body.city[37] }, { city: req.body.city[38] }, { city: req.body.city[39] },
  { city: req.body.city[40] }, { city: req.body.city[41] }, { city: req.body.city[42] },
  { city: req.body.city[43] }, { city: req.body.city[44] }, { city: req.body.city[45] },
   { city: req.body.city[46] }, { city: req.body.city[47] }, { city: req.body.city[48] },
  { city: req.body.city[49] }, { city: req.body.city[50] }, { city: req.body.city[51] },
  { city: req.body.city[52] }, { city: req.body.city[53] }, { city: req.body.city[54] },
  { city: req.body.city[55] }, { city: req.body.city[56] }, { city: req.body.city[57] },
  { city: req.body.city[58] }, { city: req.body.city[59] }, { city: req.body.city[60] },
  { city: req.body.city[61] }, { city: req.body.city[62] }, { city: req.body.city[63] },
  { city: req.body.city[64] }, { city: req.body.city[65] }, { city: req.body.city[66] },
   { city: req.body.city[67] }, { city: req.body.city[68] }, { city: req.body.city[69] },
  { city: req.body.city[70] }, { city: req.body.city[71] }, { city: req.body.city[72] },
  { city: req.body.city[73] }, { city: req.body.city[74] }, { city: req.body.city[75] },
  { city: req.body.city[76] }, { city: req.body.city[77] }, { city: req.body.city[78] },
  { city: req.body.city[79] }, { city: req.body.city[80] }, { city: req.body.city[81] },
  { city: req.body.city[82] }, { city: req.body.city[83] }, { city: req.body.city[84] },
  { city: req.body.city[85] }, { city: req.body.city[86] }, { city: req.body.city[87] },
  { city: req.body.city[88] } ]}, 
  {price: {$gte: Number(req.body.minprice), $lte: Number(req.body.maxprice)}},
  {sqft: {$gte: Number(req.body.minsqft), $lte: Number(req.body.maxsqft)}},   
  {beds: {$gte: req.body.bedsmin}},
  {garage: {$in: req.body.garages.split(',') } },
  {stories: {$lte: req.body.stories}}, 
  {baths: {$gte: req.body.bathsmin}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
  if (listing.length == 0) {
    res.render('searchResultsOrlando', {listings: listing});
  }

    res.render('searchResultsOrlando', {listings: listing});
  })
})

// THIS IS THE SHOW ROUTER FOR ORLANDO HOMES
router.get('/orlando/:id', function(req, res, next){
  listingsOrlando.findOne({_id: req.params.id}, function(err, listing){
    res.render('showOrlando', {theListing: listing})
  })
})



// CHICAGO
var db = require('monk')('localhost/listingsChicago');
var listingsChicago = db.get('listings');



router.get('/listingsChicago', function(req, res, next) {
  listingsChicago.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/ChicagoListings Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 0; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');

listingsChicago.insert({
     garage: listing[0],
     fireplace: listing[1],
     stories: listing[2] || 0,
     acreage: listing[3],
     appxsqft: Number(listing[4]) || 0,
     appxyearbuilt: listing[5],
     amenities: listing[6],
     basement: listing[7],
     city: listing[8],
     otherAmenities: listing[9],
     county: listing[10],
     elemSchool: listing[11] || 'NA',
     highSchool: listing[12] || 'NA',
     schoolDistrict: listing[13],
     middleSchool: listing[14] || 'NA',
     lastListPrice: Number(listing[15]),
     price: Number(listing[16]),
     listOffice: listing[17],
     lotSize: listing[18],
     photoCount: listing[19],
     state: listing[20],
     status: listing[21],
     streetName: listing[22],
     streetNumber: listing[23],
     subdivision: listing[24] || 'NA',
     taxes: listing[25],
     fullHalfBaths: listing[26],
     waterfront: listing[27],
     zip: listing[28],
     MLS: listing[29],  
     parkAmenities: listing[30],  
     remarks: listing[31] || 'NA',
     fullBaths: listing[32],
     halfBaths: listing[33],
     beds: listing[34],
     listDate: listing[35],
     priceSQFT: (Number(listing[16]) / Number(listing[4])).toFixed(2) || 'NA',
     hoaFee: listing[36] || 0,
     unitFloor: listing[37] || 'NA',
     unitNum: listing[38] || 'NA',
     propType: listing[39] || 'NA'
   });
}
 res.send('hello');
  // res.redirect('/');
});
})

});


router.get('/chicago', function(req, res, next){
  listingsChicago.find({}, function(err, listing){
    res.render('searchPageChicago', { title: 'Chicago Listings', listings: listing});
  })
})
  

router.post('/searchChicago', function(req, res, next){
  listingsChicago.find({ $query: {$and: [ 
  {$or: [ { city: req.body.city }, { city: req.body.city[0] }, { city: req.body.city[1] }, { city: req.body.city[2] }, { city: req.body.city[3] },
  { city: req.body.city[4] }, { city: req.body.city[5] }, { city: req.body.city[6] },
  { city: req.body.city[7] }, { city: req.body.city[8] }, { city: req.body.city[9] },
  { city: req.body.city[10] }, { city: req.body.city[11] }, { city: req.body.city[12] },
  { city: req.body.city[13] }, { city: req.body.city[14] }, { city: req.body.city[15] },
  { city: req.body.city[16] }, { city: req.body.city[17] }, { city: req.body.city[18] },
  { city: req.body.city[19] }, { city: req.body.city[20] }, { city: req.body.city[21] },
  { city: req.body.city[22] }, { city: req.body.city[23] }, { city: req.body.city[24] },
  { city: req.body.city[25] } ]},
  {price: {$gte: Number(req.body.minprice), $lte: Number(req.body.maxprice)}},
  {appxsqft: {$gte: Number(req.body.minsqft), $lte: Number(req.body.maxsqft)}}, 
  {beds: {$gte: req.body.bedsmin}},
  {garage: {$gte: req.body.garages}},
  {stories: {$lte: req.body.stories}},
  {fullBaths: {$gte: req.body.bathsmin}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
  if (listing.length == 0) {
    res.render('searchResultsChicago', {listings: listing});
  }

    res.render('searchResultsChicago', {listings: listing});
  })
})



// THIS IS THE SHOW ROUTER FOR ORLANDO HOMES
router.get('/chicago/:id', function(req, res, next){
  listingsChicago.findOne({_id: req.params.id}, function(err, listing){
    res.render('showChicago', {theListing: listing})
  })
})








module.exports = router;