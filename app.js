var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose'),
    bluebird = require('bluebird');
var favicon = require('serve-favicon');
var path = require('path');

mongoose.Promise = bluebird;

var EmailList = require('./models/EmailList');

var app = express();

app.disable('x-powered-by');
app.set('view engine','pug');
app.set('port',4000);
app.set('env','production');

app.use(bodyParser.json());
app.use('/public',express.static(path.join(__dirname,'public')));

app.get('/',function (req, res) {
    res.render('home');
    res.end();
});

app.post('/storemail',function (req, res) {

    var msg = {};

    if(!req.body.email){
        msg = {success: 0,message: "Please enter correct email"};
        res.send(JSON.stringify(msg));
        res.end();
        return;
    }

    var emailList = new EmailList(
        {
            email: req.body.email
        }
    );

    emailList.save(function (err) {
       if(err){
           msg = {success: 0,message: "Please try again or later"};
           res.send(JSON.stringify(msg));
           res.end();
           return;
       }

        msg = {success: 1,message: "Great! welcome to the Fraternity"};
        res.send(JSON.stringify(msg));
        res.end();
    });
});

app.use(function (req, res) {

    res.status(404);
    res.render('404');
});

//500 route handler
app.use(function (err,req, res,next) {

    res.status(500);
    res.render('500');
});


var database = mongoose.connect('mongodb://admin:abc1234@127.0.0.1/Akavitech',
    {
        useMongoClient: true
    });

database.on('open',function () {

    app.listen(app.get('port'),function () {
        console.log('Server now started at port '+app.get('port'));
    });
});

database.on('error',function () {
    console.log('server not started due to database failure');
});