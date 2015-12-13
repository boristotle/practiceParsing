$(document).ready(function(){

// this shows each house price in dollar format
for (var i = 0; i <= $('.price').length; i++) {
var commaPrice = Number($('.price').eq(i).html()).toLocaleString()
$('.price').eq(i).html('$' + commaPrice);
 }


// THIS IS THE ZILLOW INTEREST RATE API CALL, CHANGE THIS TO UNIREST
var ZillowApiKey = "X1-ZWz1a2ozq55nuz_7oq0o"

$.ajax({
  url: 'https://www.zillow.com/webservice/GetRateSummary.htm?zws-id=' + ZillowApiKey + '&output=json',
  dataType: "json",
  success: function(data) {
              var total = (data.response.today.thirtyYearFixed / 100 / 12) * (Math.pow((1 + (data.response.today.thirtyYearFixed / 100) / 12), 360));
              var total2 = Math.pow((1 + (data.response.today.thirtyYearFixed / 100) / 12), 360) - 1;
              var payments = 'Est. Payment:  $' + Number((total / total2) * Number($('.price').html().replace(/[,$]+/g, "").trim())).toFixed(0) + '/mo';
              $('.est').append(payments);
  } 
})


        
// THIS ADDS A LISTING TO THE USER FAVS
$(".FAV").submit(function(event) {
        // get the form data
        // there are many ways to get this data using jQuery (you can use the class or id also)
        var formData = {
            'favorite'       :  $(location).attr("href").split('/')[4]
        };
        // process the form
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : '/', // the url where we want to POST
            data        : formData, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
                        encode          : true
        })
            // using the done promise callback
            .done(function(data) {

                // log data to the console so we can see
                console.log(data); 

                // here we will handle errors and validation messages
            });
            $('.FAVBTN').text('Remove Favorite');
        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    })


// THIS REMOVES A LISTING FROM THE USER FAVS
$(".REMOVEFAV").submit(function(event) {
        // get the form data
        // there are many ways to get this data using jQuery (you can use the class or id also)
        var formData = {
            'favorite'       :  $(location).attr("href").split('/')[4]
        };
        // process the form
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : '/removeFav', // the url where we want to POST
            data        : formData, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
                        encode          : true
        })
            // using the done promise callback
            .done(function(data) {

                // log data to the console so we can see
                console.log(data); 

                // here we will handle errors and validation messages
            });
            $('.FAVBTN').text('Add Favorite');
        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    })

// SAVE FORM INPUTS TO LOCAL STORAGE

// SET MIN PRICE
$('#minprice').on('change', function (){ localStorage.setItem('minprice', this.value) })
    // GET MIN PRICE
    if (localStorage.getItem('minprice')) {
        $('#minprice').val(localStorage.getItem('minprice')).trigger('change');
     }

// GET MAX PRICE
$('#maxprice').on('change', function (){ localStorage.setItem('maxprice', this.value) })
    // SET MAX PRICE
    if (localStorage.getItem('maxprice')) {
        $('#maxprice').val(localStorage.getItem('maxprice')).trigger('change');
     }

// GET BEDS MIN
$('#bedsmin').on('change', function (){ localStorage.setItem('bedsmin', this.value) })
    // SET BEDS MIN
    if (localStorage.getItem('bedsmin')) {
        $('#bedsmin').val(localStorage.getItem('bedsmin')).trigger('change');
     }

// GET BATHS MIN
$('#bathsmin').on('change', function (){ localStorage.setItem('bathsmin', this.value) })
    // SET BATHS MIN
    if (localStorage.getItem('bathsmin')) {
        $('#bathsmin').val(localStorage.getItem('bathsmin')).trigger('change');
     }

// GET MIN SQFT
$('#minsqft').on('change', function (){ localStorage.setItem('minsqft', this.value) })
    // SET MIN SQFT
    if (localStorage.getItem('minsqft')) {
        $('#minsqft').val(localStorage.getItem('minsqft')).trigger('change');
     }

// GET MAX SQFT
$('#maxsqft').on('change', function (){ localStorage.setItem('maxsqft', this.value) })
    // SET MAX SQFT
    if (localStorage.getItem('maxsqft')) {
        $('#maxsqft').val(localStorage.getItem('maxsqft')).trigger('change');
     }

// GET CITYAUSTIN
$('#cityAustin').on('change', function (){ localStorage.setItem('cityAustin', this.value) })
    // SET MAX SQFT
    if (localStorage.getItem('cityAustin')) {
        $('#cityAustin').val(localStorage.getItem('cityAustin')).trigger('change');
     }


// GET CITYCHICAGO
$('#cityChicago').on('change', function (){ localStorage.setItem('cityChicago', this.value) })
    // SET MAX SQFT
    if (localStorage.getItem('cityChicago')) {
        $('#cityChicago').val(localStorage.getItem('cityChicago')).trigger('change');
     }

// GET CITYCS
$('#cityCS').on('change', function (){ localStorage.setItem('cityCS', this.value) })
    // SET MAX SQFT
    if (localStorage.getItem('cityCS')) {
        $('#cityCS').val(localStorage.getItem('cityCS')).trigger('change');
     }


// GET CITYNASHVILLE
$('#cityNashville').on('change', function (){ localStorage.setItem('cityNashville', this.value) })
    // SET MAX SQFT
    if (localStorage.getItem('cityNashville')) {
        $('#cityNashville').val(localStorage.getItem('cityNashville')).trigger('change');
     }


// GET CITYORLANDO
$('#cityOrlando').on('change', function (){ localStorage.setItem('cityOrlando', this.value) })
    // SET MAX SQFT
    if (localStorage.getItem('cityOrlando')) {
        $('#cityOrlando').val(localStorage.getItem('cityOrlando')).trigger('change');
     }


// GET CITYQC
$('#cityQC').on('change', function (){ localStorage.setItem('cityQC', this.value) })
    // SET MAX SQFT
    if (localStorage.getItem('cityQC')) {
        $('#cityQC').val(localStorage.getItem('cityQC')).trigger('change');
     }



// LOCAL STORAGE SET CITIES


 // SET GARAGES AUSTIN
$('#garagesAustin').on('change', function (){ localStorage.setItem('garagesAustin', this.value) })
    // SET garagesAustin
    if (localStorage.getItem('garagesAustin')) {
        $('#garagesAustin').val(localStorage.getItem('garagesAustin')).trigger('change');
     }

 // SET GARAGES CHICAGO
$('#garagesChicago').on('change', function (){ localStorage.setItem('garagesChicago', this.value) })
    // SET garagesChicago
    if (localStorage.getItem('garagesChicago')) {
        $('#garagesChicago').val(localStorage.getItem('garagesChicago')).trigger('change');
     }

 // SET GARAGES CS
$('#garagesCS').on('change', function (){ localStorage.setItem('garagesCS', this.value) })
    // SET garagesCS
    if (localStorage.getItem('garagesCS')) {
        $('#garagesCS').val(localStorage.getItem('garagesCS')).trigger('change');
     }


 // SET GARAGES NASHVILLE
$('#garagesNashville').on('change', function (){ localStorage.setItem('garagesNashville', this.value) })
    // SET garagesNashville
    if (localStorage.getItem('garagesNashville')) {
        $('#garagesNashville').val(localStorage.getItem('garagesNashville')).trigger('change');
     }


 // SET GARAGES ORLANDO
$('#garagesOrlando').on('change', function (){ localStorage.setItem('garagesOrlando', this.value) })
    // SET garagesOrlando
    if (localStorage.getItem('garagesOrlando')) {
        $('#garagesOrlando').val(localStorage.getItem('garagesOrlando')).trigger('change');
     }


 // SET GARAGES QC
$('#garagesQC').on('change', function (){ localStorage.setItem('garagesQC', this.value) })
    // SET garagesQC
    if (localStorage.getItem('garagesQC')) {
        $('#garagesQC').val(localStorage.getItem('garagesQC')).trigger('change');
     }




// LOCAL STORAGE SET STORIES

 // SET stories AUSTIN
$('#storiesAustin').on('change', function (){ localStorage.setItem('storiesAustin', this.value) })
    // SET storiesAustin
    if (localStorage.getItem('storiesAustin')) {
        $('#storiesAustin').val(localStorage.getItem('storiesAustin')).trigger('change');
     }

 // SET stories CHICAGO
$('#storiesChicago').on('change', function (){ localStorage.setItem('storiesChicago', this.value) })
    // SET storiesChicago
    if (localStorage.getItem('storiesChicago')) {
        $('#storiesChicago').val(localStorage.getItem('storiesChicago')).trigger('change');
     }

 // SET stories CS
$('#storiesCS').on('change', function (){ localStorage.setItem('storiesCS', this.value) })
    // SET storiesCS
    if (localStorage.getItem('storiesCS')) {
        $('#storiesCS').val(localStorage.getItem('storiesCS')).trigger('change');
     }


 // SET stories NASHVILLE
$('#storiesNashville').on('change', function (){ localStorage.setItem('storiesNashville', this.value) })
    // SET storiesNashville
    if (localStorage.getItem('storiesNashville')) {
        $('#storiesNashville').val(localStorage.getItem('storiesNashville')).trigger('change');
     }


 // SET stories ORLANDO
$('#storiesOrlando').on('change', function (){ localStorage.setItem('storiesOrlando', this.value) })
    // SET storiesOrlando
    if (localStorage.getItem('storiesOrlando')) {
        $('#storiesOrlando').val(localStorage.getItem('storiesOrlando')).trigger('change');
     }


 // SET stories QC
$('#storiesQC').on('change', function (){ localStorage.setItem('storiesQC', this.value) })
    // SET storiesQC
    if (localStorage.getItem('storiesQC')) {
        $('#storiesQC').val(localStorage.getItem('storiesQC')).trigger('change');
     }







});


