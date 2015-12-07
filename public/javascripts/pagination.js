$(document).ready(function() {

$('.pageNumber').hide();

var max = Number(window.location.href.split('/')[4]) + 5;
var min = Number(window.location.href.split('/')[4]) - 5;

  for (var i = Number(window.location.href.split('/')[4] - 4); i <= max; i++) {
    $('.pageNumber').eq(i).show();
  }

$('.pageNumber').eq(Number(window.location.href.split('/')[4] - 1)).addClass('active');

})