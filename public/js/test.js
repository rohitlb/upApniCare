$(document).ready(function() {

    $('.carousel').carousel();
    $('.carousel').carousel('next');
    $('.carousel').carousel('next', 3);
    $('.carousel').carousel('prev');
    $('.carousel').carousel('prev', 4);
    $('.carousel').carousel('set', 4);

    $('.modal').modal({
        dismissible: true,
        opacity: .15,
        inDuration: 300,
        outDuration: 200,
        startingTop: '4%',
        endingTop: '10%'
    });

    //for register

    $('#submitButton').click(function () {

        var name = $('#name').val();
        var number = $('#number').val();
        var password = $('#password').val();

        var data = {
            name: name,
            number: number,
            password: password
        };


        $.ajax(
            {
                url: "/register",
                method: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function (result) {

                    if (result.status === "success") {
                        window.location = '/profile';

                    }
                    else {
                        Materialize.toast(result.message, 2000);
                    }

                },
                error: function (err) {

                    console.log(err);
                }
            }
        )
    });


    //for login

    $('#loginButton1').click(function () {


        var number = $('#number1').val();
        var password = $('#password1').val();

        var data1 = {
            number: number,
            password: password
        };
        $.ajax(
            {
                url: "/login",
                method: 'POST',
                data: JSON.stringify(data1),
                contentType: 'application/json',
                success: function (result) {
                    if (result.status === "success") {
                        window.location = '/profile';
                    }
                    else {
                        Materialize.toast(result.message, 2000);
                    }
                },
                error: function (err) {

                    console.log(err);
                }
            });
    });
});