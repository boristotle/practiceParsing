$(document).ready(function(){


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

})