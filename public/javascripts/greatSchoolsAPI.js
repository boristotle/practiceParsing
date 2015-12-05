$(document).ready(function(){

    var greatSchoolsAPI_key = 'ipzksrs4y2qyffctvkxczaxx'

$.ajax({
  url: 'http://api.greatschools.org/school/tests/TX/1?key=' + greatSchoolsAPI_key + '',
  dataType: "json",
  success: function(data) {
      console.log(data)
  } 
})

})