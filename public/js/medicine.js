$(function () {

    $('#openbutton').click(function () {

        $('#registerform').show();

    });

    $('#registerform').hide();

    $('#submitbutton').click(function () {

        var name = $('#company_name').val();
        var brand_name = $('#brand_name').val();
        var salt = $('#salt').val();
        var strength = $('#strength').val();
        var packaging = $('#packaging').val();
        var price = $('#price').val();


        var data = {
            company_name : name,
            brand_name : brand_name,
            salt : salt,
            strength : strength,
            packaging : packaging,
            price : price

        };

        $.ajax({
            url: "/DrugIndex",
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                if(result) {
                    result = JSON.parse(result);
                    Materialize.toast(result.message,5000);
                }
                else {
                    window.location  = "/profile";

                }
            },
            error : function (err) {

                console.log(err);
            }
        })

    });
});