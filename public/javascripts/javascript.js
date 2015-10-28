$(document).ready(function(){
    $('[data-toggle="popover"]').popover({html: true}); 

// this shows each house price in dollar format
for (var i = 0; i <= $('.price').length; i++) {
var commaPrice = Number($('.price').eq(i).html()).toLocaleString()
$('.price').eq(i).html('$' + commaPrice);
 }


// this shows the number of results from a search
var numResults = $('.HOME').length;
$('.numResults').append(numResults + ' homes matching your search!');
      

// THIS IS THE ZILLOW INTEREST RATE API CALL, CHANGE THIS TO UNIREST
var ZillowApiKey = "X1-ZWz1a2ozq55nuz_7oq0o"

$.ajax({
  url: 'http://www.zillow.com/webservice/GetRateSummary.htm?zws-id=' + ZillowApiKey + '&output=json',
  dataType: "json",
  success: function(data) {
              var total = (data.response.today.thirtyYearFixed / 100 / 12) * (Math.pow((1 + (data.response.today.thirtyYearFixed / 100) / 12), 360));
              var total2 = Math.pow((1 + (data.response.today.thirtyYearFixed / 100) / 12), 360) - 1;
              var payments = 'Est. Mortgage Payment:  $' + Number((total / total2) * Number($('.price').html().replace(/[,$]+/g, "").trim())).toFixed(0) + '/mo';
              $('.est').append(payments);
  } 
})



// THIS FINDS THE LAT/LNG FOR THE ADDRESS ON THE SHOW PAGE and RENDERS THE MAP ON THE SHOW PAGE
$.ajax({
  url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + $('.add').text() + '&key=AIzaSyC6G3q-CSKbBqHoRbRJdsKsKHDa9hfICuU',
  dataType: "json",
  success: function(data){
          var mapCanvas = document.getElementById('map');
          console.log(data);
          var mapOptions = {
            center: new google.maps.LatLng(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng),
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          }
          var marker = new google.maps.Marker({
          position: {lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng},
          map: map
          });

          var map = new google.maps.Map(mapCanvas, mapOptions)
          marker.setMap(map);
  } 
})



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

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    })



// SAVE FORM INPUTS TO LOCAL STORAGE

  // JQUERY: (saves the name input to local storage on change);
// $('#minprice option:selected').on('change', function (){ localStorage.setItem( 'minprice', $('#minprice option:selected').val()})



// // SETS the name back to where it was when the user left the page
// $(document).ready(function() { $('#minprice option:selected').val() === (localStorage.minprice)})



// THIS CONSOLE LOGS THE ID OF THE LISTING THAT IS FAVORITED
// $('.FAVBTN').on('click', function(){
//   console.log($(location).attr("href").split('/')[4]);

// })




});


