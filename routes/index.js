var express = require('express');
var router = express.Router();
var fs = require('fs');
var dotenv = require('dotenv');
var unirest = require('unirest');
var bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'GoDaddy',
    auth: {
        user: 'admin@AustinHomesMatchmaker.com',
        pass: process.env.EMAIL_PASS
    }
});


var userFavs = require('monk')('localhost/userFavs')
var Favs = userFavs.get('favs');  

// GET THE HOME PAGE
router.get('/', function(req, res, next){
    Favs.find({email: req.session.user}, function(err, user){
      res.render('home', {cookies: [req.session.user], theUser: user})
  })
})

// GET THE SIGN IN PAGE
router.get('/signin', function(req, res, next){
  res.render('signin', {errors: []});
})

// GET THE SIGN UP PAGE
router.get('/signup', function(req, res, next){
  res.render('signup', {errors: []});
})

router.post('/signup', function(req, res, next) {
  var hash = bcrypt.hashSync(req.body.password, 8);
  var errors = [];
  if (req.body.email.length == 0 || req.body.email.indexOf('@') === -1) {
    errors.push("Invalid Email.")
  } 
  if (req.body.password.length < 8) {
    errors.push("Password must be a minimum of 8 characters.")
  }
  if (req.body.confirmPassword !== req.body.password) {
    errors.push("Password and Password Confirmation do not match.")
  }
  if (errors.length) {
    res.render('signup', {errors: errors})
  }  else {
    Favs.findOne({email: req.body.email}, function(err, data) {
      if (data) {
        errors.push("Email is already registered");
        res.render('signup', {errors: errors})
      } else {
      Favs.insert({email: req.body.email,
      password: hash, favorites: []}, function(err, user){
        req.session.user = user.email;

// THIS SENDS AN AUTO EMAIL TO NEW USERS UPON SIGNUP

    var mailOptions = {
    from: 'Darrin Bennett <admin@MyHomesMatchmaker.com>', // sender address 
    to: req.body.email, // list of receivers 
    subject: 'MyHomesMatchmaker New Account Created', // Subject line 
    text: 'Hello world', // plaintext body 
    html:  '<p>Thank you for registering with <a href="https://www.myhomesmatchmaker.com">MyHomesMatchmaker.com</a>!</p>' +
'<p>With hundreds of neighborhood real estate experts you can be sure you\'re in great hands no matter where you are looking to buy or sell! As a registered user you have access to hundreds of thousands of homes listed for sale nationwide and can get expert advice on buying and selling a home from top agents.</p>' + 
'<p>If you have questions about homes, the home buying process, or want to tour homes our agents and I are ready and happy to help!</p>'  + '<p>Thank you!</p>' + 
'<img src="cid:unique@kreata.ee" height="200px" width="150px"/>' + '<p>Darrin Bennett<br>Virtual Realty Group<br>President at MyHomesMatchmaker</p>',
   attachments: [{
        filename: 'darrin.jpg',
        path: './public/images/darrin.jpg',
        cid: 'unique@kreata.ee' //same cid value as in the html img src 
    }]
};
 
// send mail with defined transport object 
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
        // console.log(req.session.user);
          res.redirect('/');
    })
  }
   })
  }
});

router.post('/signin', function(req, res, next){
  var pass = req.body.password;
  Favs.findOne({email: req.body.email}, function(err, user) {
    if (user) { 
      // console.log(user);
      if (bcrypt.compareSync(pass, user.password)) {
        req.session.user = user.email; 
        res.redirect('/');
      }
      else {
        res.render('signin', {errors: ["Email/password don't match"]})
      }
    } 
    else if (!user) {
      res.render('signin', {errors: ["Email/password don't match"]})
    } 
  })
})



// THIS IS THE SIGNOUT PAGE
router.get('/signout', function(req, res, next){
  req.session = null;
  res.redirect('/')
})




// to set up favorites on create account, do an insert to favorites, with _id: user email address
router.post('/', function(req, res, next){
  // console.log(req.body.favorite);
  Favs.update({email: req.session.user },
    { $push: { favorites: req.body.favorite } })
})

// THIS IS TO REMOVE A FAVORITE FROM A USER LIST
router.post('/removeFav', function(req, res, next){
  Favs.update({email: req.session.user },
    { $pull: { favorites: req.body.favorite } })
})



// QC DATABASE
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/listings');
var listings = db.get('listings');
  
// get QC favorites with promises to render the listings on the page
router.get('/qcFavs/:id', function(req, res, next){
  return Favs.find({_id: req.params.id})
    .then(function(favs){
    // var rec = favs[0].favorites.map(function(r){
    //   return mongo.ObjectId(r);
    // })
    return listings.find( { MLS: { $in: favs[0].favorites } }, function(err, listing) {
      // console.log('error', err)
      // console.log('data', listing)
      // console.log(favs);
      res.render('qcFavs', {listings: listing, theUser: favs._id, cookies: [req.session.user]} );
    }) 
  })
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
     amenities: listing[25] || 'NA',
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
   Favs.find({email: req.session.user}, function(err, user){
  listings.find({}, function(err, listing){
    res.render('searchPageQC', { title: 'QC Listings', listings: listing, theUser: user, cookies: [req.session.user]});
   })
  })
})


// / THIS IS A ROUTE WITH PAGINATION FOR ALL QC LISTINGS
router.get('/searchResultsQC/:page', function(req, res, next) {
  // console.log(req.session.userSearch);
      var page = parseInt(req.params.page);
      var size = 25;
      var skip = page > 0 ? ((page - 1) * size) : 0;

      Favs.find({email: req.session.user}, function(err, user){
        listings.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } }, 
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {garage: {$gte: req.session.userSearch.garage}},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
          // console.log(listing[0]);
          var totalRecords = listing.length;
        })  

      .then(function(totalRecords) {
    listings.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } },
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {garage: {$gte: req.session.userSearch.garage}},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, {skip: skip, limit: size}, function(err, listing){
   res.render('searchResultsQC', {listings: listing, totalRecords: totalRecords, size: size, theUser: user, cookies: [req.session.user]});
   })
  })
 })
});



// THIS IS THE POST ROUTE TO SAVE SEARCH SETTINGS IN A SESSION FOR THE QC HOME SEARCH
router.post('/searchQC', function(req, res, next){
  // console.log(req.body.city);
  // console.log(typeof req.body.city)
        if (typeof req.body.city == 'string') {
        req.session.userSearch = {
        city: [req.body.city], 
        minprice: Number(req.body.minprice),
        maxprice: Number(req.body.maxprice),
        minsqft: Number(req.body.minsqft),
        maxsqft: Number(req.body.maxsqft),
        beds: req.body.bedsmin,
        baths: req.body.bathsmin,
        garage: req.body.garages,
        stories: req.body.stories
        }
      } else {
          req.session.userSearch = {
          city: req.body.city, 
          minprice: Number(req.body.minprice),
          maxprice: Number(req.body.maxprice),
          minsqft: Number(req.body.minsqft),
          maxsqft: Number(req.body.maxsqft),
          beds: req.body.bedsmin,
          baths: req.body.bathsmin,
          garage: req.body.garages,
          stories: req.body.stories
          }
      }
    // console.log(req.session.userSearch.city);
    res.redirect('/searchResultsQC/1');
})


// THIS IS THE SHOW ROUTE FOR QC HOMES
router.get('/quadCities/:MLS', function(req, res, next){
  if (!req.session.user) {
    listings.findOne({MLS: req.params.MLS}, function(err, listing){
    res.render('showQC', {theListing: listing, favs: null, theUser: [], cookies: [req.session.user]})
    })
  }
  else {
  Favs.findOne({email: req.session.user}, function(err, fav){
  listings.findOne({MLS: req.params.MLS}, function(err, listing){
    // console.log(fav);
    // console.log(listing)
    // console.log('favorites ' + fav.favorites)
    // console.log('req.params.MLS ' + req.params.MLS)  
    var favAlreadyAdded = fav.favorites.indexOf(req.params.MLS)
    res.render('showQC', {theListing: listing, favs: favAlreadyAdded, theUser: fav, cookies: [req.session.user]})
      })
  })
}
})





// NASHVILLE DATABASE
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/listingsNashville');
var listingsNashville = db.get('listingsNashville');


// get NASHVILLE favorites with promises to render the listings on the page
router.get('/nashvilleFavs/:id', function(req, res, next){
  return Favs.find({_id: req.params.id})
    .then(function(favs){
      // console.log(favs);
    return listingsNashville.find( { MLS: { $in: favs[0].favorites } }, function(err, listing) {
      res.render('nashvilleFavs', {listings: listing, theUser: favs._id, cookies: [req.session.user]} );
    }) 
  })
})



router.get('/listingsNashville', function(req, res, next) {
   listingsNashville.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/nashvilleListings Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 0; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');


    if (typeof listing[28] === 'string') {
    var upperCity = listing[28].toUpperCase();
  }

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
     city: upperCity,
     remarks: listing[29],
     amenities: listing[30],
     MLS: Number(listing[31]).toString(),
     priceSQFT: (Number(listing[8]) / Number(listing[17])).toFixed(2)
   });
}
 res.send('hello');
  // res.redirect('/');
  });
})

});


router.get('/nashville', function(req, res, next){
  Favs.find({email: req.session.user}, function(err, user){
  listingsNashville.find({city: 'NASHVILLE'}, {limit: 25, skip: 0} , function(err, listing){
    res.render('searchPageNashville', { title: 'Nashville Listings', theUser: user,  listings: listing, cookies: [req.session.user]});
  })
 })
})



// / THIS IS A ROUTE WITH PAGINATION FOR ALL NASHVILLE LISTINGS
router.get('/searchResultsNashville/:page', function(req, res, next) {
  // console.log(req.session.userSearch);
      var page = parseInt(req.params.page);
      var size = 25;
      var skip = page > 0 ? ((page - 1) * size) : 0;

      Favs.find({email: req.session.user}, function(err, user){
        listingsNashville.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } }, 
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {stories: {$in: req.session.userSearch.stories } },
  {garage: {$gte: req.session.userSearch.garage}},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
          // console.log(listing[0]);
          var totalRecords = listing.length;
        })  

      .then(function(totalRecords) {
    listingsNashville.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } },
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {stories: {$in: req.session.userSearch.stories } },
  {garage: {$gte: req.session.userSearch.garage}},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, {skip: skip, limit: size}, function(err, listing){
   res.render('searchResultsNashville', {listings: listing, totalRecords: totalRecords, size: size, theUser: user, cookies: [req.session.user]});
   })
  })
 })
});





// THIS IS THE POST ROUTE TO SAVE SEARCH SETTINGS IN A SESSION FOR THE NASHVILLE HOME SEARCH
router.post('/searchNashville', function(req, res, next){
  // console.log(req.body.city);
  // console.log(typeof req.body.city)
        if (typeof req.body.city == 'string') {
        req.session.userSearch = {
        city: [req.body.city], 
        minprice: Number(req.body.minprice),
        maxprice: Number(req.body.maxprice),
        minsqft: Number(req.body.minsqft),
        maxsqft: Number(req.body.maxsqft),
        beds: req.body.bedsmin,
        baths: req.body.bathsmin,
        garage: req.body.garages,
        stories: req.body.stories.split(',')
        }
      } else {
          req.session.userSearch = {
          city: req.body.city, 
          minprice: Number(req.body.minprice),
          maxprice: Number(req.body.maxprice),
          minsqft: Number(req.body.minsqft),
          maxsqft: Number(req.body.maxsqft),
          beds: req.body.bedsmin,
          baths: req.body.bathsmin,
          garage: req.body.garages,
          stories: req.body.stories.split(',')
          }
      }
    // console.log(req.session.userSearch.city);
    res.redirect('/searchResultsNashville/1');
})




// THIS IS THE SHOW ROUTE FOR NASHVILLE HOMES
router.get('/nashville/:MLS', function(req, res, next){
  if (!req.session.user) {
    listingsNashville.findOne({MLS: req.params.MLS}, function(err, listing){
      // console.log(listing);
    res.render('showNashville', {theListing: listing, favs: null, theUser: [], cookies: [req.session.user]})
    })
  }
  else {
  Favs.findOne({email: req.session.user}, function(err, fav){
  listingsNashville.findOne({MLS: req.params.MLS}, function(err, listing){ 
    var favAlreadyAdded = fav.favorites.indexOf(req.params.MLS)
    res.render('showNashville', {theListing: listing, favs: favAlreadyAdded, theUser: fav, cookies: [req.session.user]})
      })
  })
}
})




// COLLEGE STATION
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/listingsCollegeStation');
var listingsCollegeStation = db.get('listingsCollegeStation');



// get COLLEGE STATION favorites with promises to render the listings on the page
router.get('/collegeStationFavs/:id', function(req, res, next){
  return Favs.find({_id: req.params.id})
    .then(function(favs){
      // console.log(favs);
    return listingsCollegeStation.find( { MLS: { $in: favs[0].favorites } }, function(err, listing) {
      res.render('collegeStationFavs', {listings: listing, theUser: favs._id, cookies: [req.session.user]} );
    }) 
  })
})



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
     priceSQFT: Number(listing[31]).toFixed(2),
     masterMain: listing[32]
   });
}
 res.send('hello');
  // res.redirect('/');
});
})

});



router.get('/collegeStation', function(req, res, next){
    Favs.find({email: req.session.user}, function(err, user){
  listingsCollegeStation.find({}, function(err, listing){
    res.render('searchPageCS', { title: 'College Station Listings', listings: listing, theUser: user, cookies: [req.session.user]});
  })
})
})


// / THIS IS A ROUTE WITH PAGINATION FOR ALL NASHVILLE LISTINGS
router.get('/searchResultsCS/:page', function(req, res, next) {
  // console.log(req.session.userSearch);
      var page = parseInt(req.params.page);
      var size = 25;
      var skip = page > 0 ? ((page - 1) * size) : 0;

      Favs.find({email: req.session.user}, function(err, user){
        listingsCollegeStation.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } }, 
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {stories: {$in: req.session.userSearch.stories } },
  {garage: {$in: req.session.userSearch.garage }},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
          // console.log(listing[0]);
          var totalRecords = listing.length;
        })  

      .then(function(totalRecords) {
    listingsCollegeStation.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } },
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {stories: {$in: req.session.userSearch.stories } },
  {garage: {$in: req.session.userSearch.garage }},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, {skip: skip, limit: size}, function(err, listing){
   res.render('searchResultsCS', {listings: listing, totalRecords: totalRecords, size: size, theUser: user, cookies: [req.session.user]});
   })
  })
 })
});





// THIS IS THE POST ROUTE TO SAVE SEARCH SETTINGS IN A SESSION FOR THE NASHVILLE HOME SEARCH
router.post('/searchCS', function(req, res, next){
  // console.log(req.body.city);
  // console.log(typeof req.body.city)
        if (typeof req.body.city == 'string') {
        req.session.userSearch = {
        city: [req.body.city], 
        minprice: Number(req.body.minprice),
        maxprice: Number(req.body.maxprice),
        minsqft: Number(req.body.minsqft),
        maxsqft: Number(req.body.maxsqft),
        beds: req.body.bedsmin,
        baths: req.body.bathsmin,
        garage: req.body.garages.split(','),
        stories: req.body.stories.split(',')
        }
      } else {
          req.session.userSearch = {
          city: req.body.city, 
          minprice: Number(req.body.minprice),
          maxprice: Number(req.body.maxprice),
          minsqft: Number(req.body.minsqft),
          maxsqft: Number(req.body.maxsqft),
          beds: req.body.bedsmin,
          baths: req.body.bathsmin,
          garage: req.body.garages.split(','),
          stories: req.body.stories.split(',')
          }
      }
    // console.log(req.session.userSearch.city);
    res.redirect('/searchResultsCS/1');
})




// THIS IS THE SHOW ROUTE FOR COLLEGE STATION HOMES
router.get('/collegeStation/:MLS', function(req, res, next){
  if (!req.session.user) {
    listingsCollegeStation.findOne({MLS: req.params.MLS}, function(err, listing){
      // console.log(listing);
    res.render('showCollegeStation', {theListing: listing, favs: null, theUser: [], cookies: [req.session.user]})
    })
  }
  else {
  Favs.findOne({email: req.session.user}, function(err, fav){
  listingsCollegeStation.findOne({MLS: req.params.MLS}, function(err, listing){ 
    var favAlreadyAdded = fav.favorites.indexOf(req.params.MLS)
    res.render('showCollegeStation', {theListing: listing, favs: favAlreadyAdded, theUser: fav, cookies: [req.session.user]})
      })
  })
}
})




// AUSTIN
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/listingsAustin'); 
var listingsAustin = db.get('listingsAustin');


// get AUSTIN favorites with promises to render the listings on the page
router.get('/austinFavs/:id', function(req, res, next){
  return Favs.find({_id: req.params.id})
    .then(function(favs){
      // console.log(favs);
    return listingsAustin.find( { MLS: { $in: favs[0].favorites } }, function(err, listing) {
      res.render('austinFavs', {listings: listing, theUser: favs._id, cookies: [req.session.user]} );
    }) 
  })
})

// router.get('/newAustin', function(req, res, next){
//   res.render('newAustin');
// })


// / THIS IS A ROUTE WITH PAGINATION FOR ALL AUSTIN LISTINGS
router.get('/searchResultsAustin/:page', function(req, res, next) {
      var page = parseInt(req.params.page);
      var size = 25;
      var skip = page > 0 ? ((page - 1) * size) : 0;

      Favs.find({email: req.session.user}, function(err, user){
        listingsAustin.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } }, 
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {stories: {$in: req.session.userSearch.stories } },
  {garage: {$gte: req.session.userSearch.garage }},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
          // console.log(listing[0]);
          var totalRecords = listing.length;
        })  

      .then(function(totalRecords) {
    listingsAustin.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } },
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {stories: {$in: req.session.userSearch.stories } },
  {garage: {$gte: req.session.userSearch.garage }},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, {skip: skip, limit: size}, function(err, listing){
   res.render('searchResultsAustin', {listings: listing, totalRecords: totalRecords, size: size, theUser: user, cookies: [req.session.user]});
   })
  })
 })
});





// THIS IS THE POST ROUTE TO SAVE SEARCH SETTINGS IN A SESSION FOR THE AUSTIN HOME SEARCH
router.post('/searchAustin', function(req, res, next){
        if (typeof req.body.city == 'string') {
        req.session.userSearch = {
        city: [req.body.city], 
        minprice: Number(req.body.minprice),
        maxprice: Number(req.body.maxprice),
        minsqft: Number(req.body.minsqft),
        maxsqft: Number(req.body.maxsqft),
        beds: req.body.bedsmin,
        baths: req.body.bathsmin,
        garage: req.body.garages,
        stories: req.body.stories.split(',')
        }
      } else {
          req.session.userSearch = {
          city: req.body.city, 
          minprice: Number(req.body.minprice),
          maxprice: Number(req.body.maxprice),
          minsqft: Number(req.body.minsqft),
          maxsqft: Number(req.body.maxsqft),
          beds: req.body.bedsmin,
          baths: req.body.bathsmin,
          garage: req.body.garages,
          stories: req.body.stories.split(',')
          }
      }
    res.redirect('/searchResultsAustin/1');
})



// CREATE A POST REQUEST TO SEARCH BY CITY AUSTIN
router.post('/citySearchAustin', function(req, res, next){
      var cityArr = req.body.city.split(' ');
      var output = []
      for (var i = 0; i < cityArr.length; i++) {
        output.push(cityArr[i][0].toUpperCase() + cityArr[i].substring(1).toLowerCase());
      }

          req.session.userSearch.city = [output.join(' ')]; 

    res.redirect('/searchResultsAustin/1');
})





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
     priceSQFT: (Number(listing[11]) / Number(listing[22])).toFixed(2),
     MLS: Number(listing[41]).toString()
   });
}
 res.send('hello'); 
});
})
});


router.get('/austin', function(req, res, next){
    Favs.find({email: req.session.user}, function(err, user){
  listingsAustin.find({}, function(err, listing){
    res.render('searchPageAustin', { title: 'Austin Listings', listings: listing, theUser: user, cookies: [req.session.user]});
  })
})
})



// THIS IS THE SHOW ROUTE FOR AUSTIN HOMES
router.get('/austin/:MLS', function(req, res, next){
  if (!req.session.user) {
    listingsAustin.findOne({MLS: req.params.MLS}, function(err, listing){
    res.render('showAustin', {theListing: listing, favs: null, theUser: [], cookies: [req.session.user]})
    })
  }
  else {
  Favs.findOne({email: req.session.user}, function(err, fav){
  listingsAustin.findOne({MLS: req.params.MLS}, function(err, listing){ 
    var favAlreadyAdded = fav.favorites.indexOf(req.params.MLS)
    res.render('showAustin', {theListing: listing, favs: favAlreadyAdded, theUser: fav, cookies: [req.session.user]})
      })
  })
}
})




// ORLANDO
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/listingsOrlando');
var listingsOrlando = db.get('listingsOrlando');

// get ORLANDO favorites with promises to render the listings on the page
router.get('/orlandoFavs/:id', function(req, res, next){
  return Favs.find({_id: req.params.id})
    .then(function(favs){
      // console.log(favs);
    return listingsOrlando.find( { MLS: { $in: favs[0].favorites } }, function(err, listing) {
      res.render('orlandoFavs', {listings: listing, theUser: favs._id, cookies: [req.session.user]} );
    }) 
  })
})




router.get('/listingsOrlando', function(req, res, next) {
  listingsOrlando.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/OrlandoListings Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 1; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');
  // console.log(listing);

    if (typeof listing[28] === 'string') {
    var upperCity = listing[28].toUpperCase();
  }

  // console.log(upperCity);

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
     city: upperCity,
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
    Favs.find({email: req.session.user}, function(err, user){
  listingsOrlando.find({city: 'ORLANDO', price: { $gte: 250000} }, {limit: 25, skip: 0}, function(err, listing){
    res.render('searchPageOrlando', { title: 'Orlando Listings', listings: listing, theUser: user, cookies: [req.session.user]});
  })
})
})
  



// / THIS IS A ROUTE WITH PAGINATION FOR ALL ORLANDO LISTINGS
router.get('/searchResultsOrlando/:page', function(req, res, next) {
      var page = parseInt(req.params.page);
      var size = 25;
      var skip = page > 0 ? ((page - 1) * size) : 0;

      Favs.find({email: req.session.user}, function(err, user){
      listingsOrlando.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } }, 
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {stories: {$lte: req.session.userSearch.stories } },
  {garage: {$in: req.session.userSearch.garage }},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
          var totalRecords = listing.length;
        })  

      .then(function(totalRecords) {
    listingsOrlando.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } },
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {sqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {stories: {$lte: req.session.userSearch.stories } },
  {garage: {$in: req.session.userSearch.garage }},
  {baths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, {skip: skip, limit: size}, function(err, listing){
   res.render('searchResultsOrlando', {listings: listing, totalRecords: totalRecords, size: size, theUser: user, cookies: [req.session.user]});
   })
  })
 })
});



// THIS IS THE POST ROUTE TO SAVE SEARCH SETTINGS IN A SESSION FOR THE ORLANDO HOME SEARCH
router.post('/searchOrlando', function(req, res, next){
        if (typeof req.body.city == 'string') {
        req.session.userSearch = {
        city: [req.body.city], 
        minprice: Number(req.body.minprice),
        maxprice: Number(req.body.maxprice),
        minsqft: Number(req.body.minsqft),
        maxsqft: Number(req.body.maxsqft),
        beds: req.body.bedsmin,
        baths: req.body.bathsmin,
        garage: req.body.garages.split(','),
        stories: req.body.stories
        }
      } else {
          req.session.userSearch = {
          city: req.body.city, 
          minprice: Number(req.body.minprice),
          maxprice: Number(req.body.maxprice),
          minsqft: Number(req.body.minsqft),
          maxsqft: Number(req.body.maxsqft),
          beds: req.body.bedsmin,
          baths: req.body.bathsmin,
          garage: req.body.garages.split(','),
          stories: req.body.stories
          }
      }
    res.redirect('/searchResultsOrlando/1');
})


// CREATE A POST REQUEST TO SEARCH BY CITY ORLANDO
router.post('/citySearchOrlando', function(req, res, next){
          req.session.userSearch.city = [req.body.city.toUpperCase()]; 

    res.redirect('/searchResultsOrlando/1');
})



// THIS IS THE SHOW ROUTE FOR ORLANDO HOMES
router.get('/orlando/:MLS', function(req, res, next){
  if (!req.session.user) {
    listingsOrlando.findOne({MLS: req.params.MLS}, function(err, listing){
      // console.log(listing);
    res.render('showOrlando', {theListing: listing, favs: null, theUser: [], cookies: [req.session.user]})
    })
  }
  else {
  Favs.findOne({email: req.session.user}, function(err, fav){
  listingsOrlando.findOne({MLS: req.params.MLS}, function(err, listing){ 
    var favAlreadyAdded = fav.favorites.indexOf(req.params.MLS)
    res.render('showOrlando', {theListing: listing, favs: favAlreadyAdded, theUser: fav, cookies: [req.session.user]})
      })
  })
}
})



// CHICAGO
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/listingsChicago');
var listingsChicago = db.get('listingsChicago');


// get CHICAGO favorites with promises to render the listings on the page
router.get('/chicagoFavs/:id', function(req, res, next){
  return Favs.find({_id: req.params.id})
    .then(function(favs){
      // console.log(favs);
    return listingsChicago.find( { MLS: { $in: favs[0].favorites } }, function(err, listing) {
      // console.log(listing);
      res.render('chicagoFavs', {listings: listing, theUser: favs._id, cookies: [req.session.user]} );
    }) 
  })
})



router.get('/listingsChicago', function(req, res, next) {
  listingsChicago.remove({}).then(function(){
fs.readFile('/Users/DarrinBennett/documents/ChicagoListings Doc', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var listingsArray = data.split('\n');
for (var i = 0; i < listingsArray.length; i++) {
  var listing = listingsArray[i].split('|');

  if (typeof listing[8] === 'string') {
    var upperCity = listing[8].toUpperCase();
  }

  // console.log(upperCity);

listingsChicago.insert({
     garage: listing[0],
     fireplace: listing[1],
     stories: listing[2] || 0,
     acreage: listing[3],
     appxsqft: Number(listing[4]) || 0,
     appxyearbuilt: listing[5],
     amenities: listing[6],
     basement: listing[7],
     city: upperCity,
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
    Favs.find({email: req.session.user}, function(err, user){
  listingsChicago.find({city: 'CHICAGO', price: { $gte: 250000}, appxsqft: { $gte: 1000} }, {limit: 25, skip: 0}, function(err, listing){
    res.render('searchPageChicago', { title: 'Chicago Listings', listings: listing, theUser: user, cookies: [req.session.user]});
  })
})
})
  


// / THIS IS A ROUTE WITH PAGINATION FOR ALL CHICAGO LISTINGS
router.get('/searchResultsChicago/:page', function(req, res, next) {
  // console.log(req.session.userSearch);
      var page = parseInt(req.params.page);
      var size = 25;
      var skip = page > 0 ? ((page - 1) * size) : 0;

      Favs.find({email: req.session.user}, function(err, user){
        listingsChicago.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } }, 
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {appxsqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {garage: {$gte: req.session.userSearch.garage }},
  {fullBaths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, function(err, listing){
          // console.log(listing.length);
          var totalRecords = listing.length;
        })  

      .then(function(totalRecords) {
    listingsChicago.find({ $query: {$and: [ 
  {city: {$in: req.session.userSearch.city } },
  {price: {$gte: Number(req.session.userSearch.minprice), $lte: Number(req.session.userSearch.maxprice)}},
  {appxsqft: {$gte: Number(req.session.userSearch.minsqft), $lte: Number(req.session.userSearch.maxsqft)}}, 
  {beds: {$gte: req.session.userSearch.beds}},
  {garage: {$gte: req.session.userSearch.garage }},
  {fullBaths: {$gte: req.session.userSearch.baths}
}]}, $orderby: { price : Number(-1) }
   
}, {skip: skip, limit: size}, function(err, listing){
   res.render('searchResultsChicago', {listings: listing, totalRecords: totalRecords, size: size, theUser: user, cookies: [req.session.user]});
   })
  })
 })
});



// THIS IS THE POST ROUTE TO SAVE SEARCH SETTINGS IN A SESSION FOR THE CHICAGO HOME SEARCH
router.post('/searchChicago', function(req, res, next){
        if (typeof req.body.city == 'string') {
        req.session.userSearch = {
        city: [req.body.city], 
        minprice: Number(req.body.minprice),
        maxprice: Number(req.body.maxprice),
        minsqft: Number(req.body.minsqft),
        maxsqft: Number(req.body.maxsqft),
        beds: req.body.bedsmin,
        baths: req.body.bathsmin,
        garage: req.body.garages,
        stories: req.body.stories
        }
      } else {
          req.session.userSearch = {
          city: req.body.city, 
          minprice: Number(req.body.minprice),
          maxprice: Number(req.body.maxprice),
          minsqft: Number(req.body.minsqft),
          maxsqft: Number(req.body.maxsqft),
          beds: req.body.bedsmin,
          baths: req.body.bathsmin,
          garage: req.body.garages,
          stories: req.body.stories
          }
      }
    res.redirect('/searchResultsChicago/1');
})



// CREATE A POST REQUEST TO SEARCH BY CITY CHICAGO
router.post('/citySearchChicago', function(req, res, next){
          req.session.userSearch.city = [req.body.city.toUpperCase()]; 

    res.redirect('/searchResultsChicago/1');
})


// THIS IS THE SHOW ROUTE FOR CHICAGO HOMES
router.get('/chicago/:MLS', function(req, res, next){
  if (!req.session.user) {
    listingsChicago.findOne({MLS: req.params.MLS}, function(err, listing){
      // console.log(listing);
    res.render('showChicago', {theListing: listing, favs: null, theUser: [], cookies: [req.session.user]})
    })
  }
  else {
  Favs.findOne({email: req.session.user}, function(err, fav){
  listingsChicago.findOne({MLS: req.params.MLS}, function(err, listing){ 
    var favAlreadyAdded = fav.favorites.indexOf(req.params.MLS)
    res.render('showChicago', {theListing: listing, favs: favAlreadyAdded, theUser: fav, cookies: [req.session.user]})
      })
  })
}
})




module.exports = router;