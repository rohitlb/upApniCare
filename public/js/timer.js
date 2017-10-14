var countDownDate = new Date("Nov 1, 2017 00:00:00").getTime();

var x = setInterval(function () {

    var now = new Date().getTime();

    var distance = countDownDate - now;

    var days = Math.floor(distance/(1000*60*60*24));
    var hours = Math.floor((distance%(1000*60*60*24))/(1000*60*60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    $('#launchDay').text(days);
    $('#launchHour').text(hours);
    $('#launchMinute').text(minutes);
    $('#launchSecond').text(seconds);
},1000);