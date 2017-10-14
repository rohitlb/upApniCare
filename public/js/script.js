$(function () {

    //starting ripples
    $('#mainbg').ripples(
        {
            interactive: false
        }
    );


    setInterval(function () {

        $('#mainbg').ripples('drop',50,50,20,0.08);

    },10000);


    $('.submitButton').on('click',function () {

        var email = $('#notifyEmail').val();
        var emailRegex = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";

        if(!email.match(emailRegex)) {
            Materialize.toast('In-valid Email. Please enter a correct mail',4000,'rounded white black-text');
            return;
        }

        var data = {
            email: email
        };

        $.ajax(
            {
                type: 'POST',
                url: '/storemail',
                data: JSON.stringify(data),
                contentType: "application/json",
                success: function (res) {

                    res = JSON.parse(res);

                    switch(res.success)
                    {
                        case 0:
                            $('#notifyEmail').focus();
                            break;
                        case 1:
                            $('#notifyEmail').val("");
                            break;
                    }

                    Materialize.toast(res.message,5000,'rounded white black-text');
                },
                error: function (err) {
                    Materialize.toast('Hmmm...Slow day\nCheck your internet',5000,'rounded white black-text');
                }
            }
        );
    });


    $('.modal').modal(
        {
            dismissible: true,
            inDuration: 0,
            outDuration: 0
        }
    );

});