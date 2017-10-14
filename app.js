// require dependicies
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var promise = require('bluebird');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bcrypt = require('bcryptjs');
var mongoDBStore = require('connect-mongodb-session')(session);
mongoose.Promise = promise;
var async = require('async');

// require for user registration
var User  = require('./model/registration');

//require for medicine index
var Company = require('./model/company');
var Brand = require('./model/brand');
var Dosage = require('./model/dosage');
var Strength = require('./model/strength');

//declare the app
var app = express();

var store = new mongoDBStore({
    uri : 'mongodb://localhost/Duplicate',
    collection : 'mySessions'
});

store.on('error',function (error) {
    assert.ifError(error);
    assert.ok(false);
});

// to hide X-Powered-By for Security,Save Bandwidth in ExpressJS(node.js)
app.disable('x-powered-by');

//configure the app
app.set('port',4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//set all middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());
app.use(session({
    secret : 'keyboard cat',
    cookie : {maxAge : 1000* 60 * 60 * 24 * 7},
    store : store,
    resave : false,
    saveUninitialized : true
}));

app.get('/test',function (req,res) {
    async.series([
            function (callback) {
                var name = {first_name: "akarsh", last_name: "sachdeva"};
                callback(null, name);
            },
            function (callback) {
                var education = {year: "2017", course: "Btech"};
                callback(null, education);
            },
            function (callback) {
                var skills = ['none', 'none', 'none'];
                callback(null, skills);
            }
        ],
        function (err, results) {
            if (err) {
                console.log(err);
                res.end();
            }
            var data = {
                "personal" : results[0],
                "educations" : results[1],
                "skills" :results[2]
            };
            res.send(data);
        });

});

app.get('/testagain',function (req,res) {
    async.series({
        personal: function (callback) {
            setTimeout(function () {
                var name = {first_name: "akarsh", last_name: "sachdeva"};
                callback(null, name);
            }, 300);
        },
        educations: function (callback) {
            setTimeout(function () {
                var education = {year: "2017", course: "Btech"};
                callback(null, education);
            }, 200);
        },
        skills: function (callback) {
            setTimeout(function () {
                var skills = ['none', 'none', 'none'];
                callback(null, skills);
            }, 100);
        }
    },
        function (err, results) {
            if (err) {
                console.log(err);
            }
            else{
                res.send(results);
            }
        });
});

app.get('/home',function (req,res) {
    if (req.session.userID) {
        res.redirect('/profile');
        res.end();
    } else {
        res.render('home');
        res.end();
    }
});

app.get('/', function (req, res) {
        res.render('home');
        res.end();
});

app.post('/register', function (req, res) {
    User.findOne({Number: req.body.number}).exec(function (err, result) {
        if (err) {
            console.log("Some error occured");
            res.end();
        } else {
            console.log(result);
            if (result) {
                console.log("User Already Exist");
                res.send({status: "failure", message: "user Already Exists"});
                res.end();
            } else {
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(req.body.password, salt, function (err, hash) {
                        var user = new User({
                            Name: req.body.name,
                            Number: req.body.number,
                            Password: hash
                        });
                        user.save(function (err, results) {
                            if (err) {
                                console.log("There is an error");
                                res.end();
                            } else {
                                console.log(results);
                                console.log('user save successfully');
                                res.send({status: "success", message: "successfully registered"});
                                //res.redirect('/login');
                                res.end();
                            }
                        });
                    });
                });
            }
        }
    });
});

//login with filter and session
app.post('/login',function (req,res) {
    User.findOne({Password : req.body.password}).exec(function (err,result) {
        if(err){
            console.log("Some error occurred");
            res.send({status: "failure", message : "Some error occurred"});
            res.end();
        }
        else {
            console.log(result);
            if(result) {
                bcrypt.compare(req.body.number,result.Number,function(err, results) {
                    if(err){
                        console.log(err);
                    }
                    else {
                       // console.log(result.Name);
                        if (results) {
                            console.log("Successfully login");
                            req.session.userID = result._id;
                            if (req.session.userID) {
                                res.send({
                                    status: "success",
                                    message: "successfully login",
                                    number: req.body.number
                                });
                                res.end();
                            }
                        }
                        else {
                            res.send({status: "failure", message: "Wrong credentials"});
                        }
                    }
                });
            }
            else {
                        console.log("check your Password");
                        res.send({status: "failure", message: "Can't login"});
                        res.end();
            }
        }
    });
});

//render logout page
app.get('/logout', function (req, res) {
    res.render('logout');
});

//logout the user
app.get('/startlogout', function (req, res) {
        req.session.destroy(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/home');
            }
        });
    });

//render profile page of user
app.get('/profile', function (req, res) {
    res.render('profile');
});

app.get('/medicine',function (req,res) {
    res.render('medicine');
});

//
// app.post('/medicine',function (req,res) {
//     var dosage_form = req.body.dosage_form;
//     var brand_name = req.body.brand_name;
//     var company_name = req.body.company_name;
//     var strength = req.body.strength;
//
//
//     var active_ingredients = req.body.active_ingredients;
//     var packaging = req.body.packaging;
//     var price = req.body.price;
//
//
//     async.waterfall([
//         function (callback) {
//             Company.findOne({company_name: company_name},{},{},function (err, result) {
//                if(err)
//                    throw new Error('you fucked up');
//
//                callback(null,result);
//             });
//         },
//         function (result,callback) {
//             if(result){
//
//             }
//             else{
//
//             }
//         }
//
//     ],function (err, result) {
//         res.send(result.toString());
//         res.end();
//     });
//
// });

app.post('/medicine',function (req,res) {
    var dosage_form = req.body.dosage_form;
    var brand_name = req.body.brand_name;
    var company_name = req.body.company_name;
    var strength = req.body.strength;
    var active_ingredients = req.body.active_ingredients;
    var packaging = req.body.packaging;
    var price = req.body.price;

    async.waterfall([
        function (callback) {
            Company.findOne({company_name: company_name}, function (err, result) {
                if (err) {
                    console.log(err);
                    throw new Error(err);
                }
                else {
                    callback(null, result);
                }
            });
        },
        function (result,callback) {
            if(result){
                Brand.findOne({brand_name : brand_name},function (err,result1) {
                    if(err){
                        console.log(err);
                        throw new Error(err);
                    }
                    else{
                        callback(null,result1);
                    }
                });
            }
            else{
                Brand.findOne({brand_name :brand_name},function (err1,result1) {
                    if(err1){
                        console.log(err1);
                        throw new Error(err1);
                    }
                    else{
                        if(result1){
                            res.send("other company cannot have same brand");
                        }
                        else{
                            var strength = new Strength({
                                strength : strength,
                                active_ingredients : {name : active_ingredients},
                                packaging : packaging,
                                price : price
                            });
                            strength.save(function (err2,result2) {
                                if(err2){
                                    console.log(err2);
                                    throw new Error(err2);
                                }
                                else {
                                    var dosage = new Dosage({
                                        dosage_form: dosage_form,
                                        strength_id: result2._id
                                    });
                                    dosage.save(function (err3, result3) {
                                        if(err3){
                                            console.log(err3);
                                            throw new Error(err3);                                        }
                                        else{
                                            var brand = new Brand({
                                                brand_name : brand_name,
                                                dosage_id : result3._id
                                            });
                                            brand.save(function (err4,result4) {
                                                if(err4){
                                                    console.log(err4);
                                                    throw new Error(err4);                                                }
                                                else{
                                                    var company = new Company({
                                                        company_name : company_name,
                                                        brand_id : result4._id
                                                    });
                                                    company.save(function(err5){
                                                        if(err5){
                                                            console.log(err5);
                                                            throw new Error(err5);                                                        }
                                                        else{
                                                            res.send("New medicine added");
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    });
                                }
                            });
                        }

                    }
                });
            }
        },
        function (result,callback) {
            if(result){
                Dosage.findOne({dosage_form : dosage_form},function (err,result1) {
                    if(err){
                        console.log(err);
                        throw new Error(err);
                    }
                    else{
                        callback(null,result1);
                    }
                });
            }
            else{
                var strength = new Strength({
                    strength : strength,
                    active_ingredients : {name : active_ingredients},
                    packaging : packaging,
                    price : price
                });
                strength.save(function (err,result) {
                    if(err){
                        console.log(err);
                    }
                    else {
                        var dosage = new Dosage({
                            dosage_form: dosage_form,
                            strength_id: result._id
                        });
                        dosage.save(function (err1, result1) {
                            if(err1){
                                console.log(err1);
                            }
                            else{
                                var brand = new Brand({
                                    brand_name : brand_name,
                                    dosage_id : result1._id
                                });
                                brand.save(function (err2,result2) {
                                    if(err2){
                                        console.log(err2);
                                    }
                                    else{
                                        Company.update({company_name : company_name},{
                                            $push :{brand_id : result2._id}
                                        }).exec(function (err3) {
                                            if (err3) {
                                                console.log(err3);
                                            }
                                            else {
                                                res.send("Brand added successfully  with dosage and strength");
                                            }
                                        });
                                    }
                                })
                            }
                        });
                    }
                });
            }
        },
        function (result,callback) {
            if(result){
                Strength.findOne({strength : strength},function (err,result1) {
                    if(err){
                        console.log(err);
                        throw new Error(err);                    }
                    else{
                        callback(null,result1);
                    }
                });
            }
            else{
                var sTrength = new Strength({
                    strength : strength,
                    active_ingredients : {name : active_ingredients},
                    packaging : packaging,
                    price : price
                });
                sTrength.save(function (err,result1) {
                    if(err){
                        console.log(err);
                    }
                    else {
                        var dosage = new Dosage({
                            dosage_form: dosage_form,
                            strength_id: result1._id
                        });
                        dosage.save(function (err1, result2) {
                            if(err1){
                                console.log(err1);
                            }
                            else{
                                Brand.update({brand_name : brand_name},{
                                    $push : {dosage_id : result2._id}
                                }).exec(function (err2) {
                                    if(err2){
                                        console.log(err2);
                                    }
                                    else{
                                        res.send("Dosage added successfully with strength");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        function (result) {
            if(result){
                res.send("Medicines already exists");
            }
            else{
                var strength = new Strength({
                    strength : strength,
                    active_ingredients : {name : active_ingredients},
                    packaging : packaging,
                    price : price
                });
                strength.save(function (err,result1) {
                    if(err){
                        console.log(err);
                    }
                    else{
                        Dosage.update({dosage_form : dosage_form},{
                            $push : {strength_id : result1._id}
                        }).exec(function (err2) {
                            if(err2){
                                console.log(err2);
                            }
                            else{
                                res.send("strength added successfully");
                            }
                        });
                    }
                });
            }
        }
        ],
        function (err) {
            if (err) {
                console.log(err);
            }
            else {
                res.send("done");
            }
        }
        );
});

app.get('/findcompany',function (req,res) {
    Company.find().exec(function (err,result) {
        if(err){
            console.log(err);
        }
        else{
            var data = {};
            data['result'] = [];
            for (var i=0; i<result.length; i++) {
                data['result'][i] = {
                    company : result[i].company_name,
                    brand : result[i].brand_id
                };
            }
            res.render('findcompany', {data: data});
        }
    });
});

app.get('/gotobrand',function (req,res) {
    var brand = req.query.brand;
    Company.find({company_name : brand}).exec(function (err,result) {
        if(err){
            console.log(err);
        }

        else{

            var data = {};
            data['result'] = [];

            for (var i=0; i<result.length; i++) {
                data['result'][i] = {brand : result[i].brand_id};
            }

            // using for loop

            // var datas = {};
            // datas['results'] = [];
            // for(var j=0;j<data.result[0].brand.length;j++) {
            //
            //     Brand.findById(data.result[0].brand[j], function (err1, result1) {
            //
            //         datas['results'][j] = {
            //             brand: result1.brand_name,
            //             dosage: result1.dosage_id
            //         };
            //
            //         //console.log(datas['results'][j]);
            //
            //
            //     });
            // }
            //console.log(datas);

            // using recursion

            var datas = {};
            datas['results'] = [];
            var j = 0;
            function brand(j) {

                if (j >= data.result[0].brand.length) {
                    // here datas is correct
                    console.log(datas);
                    return datas;
                }

                Brand.findById(data.result[0].brand[j], function (err1, result1) {

                    datas['results'][j] = {
                        brand: result1.brand_name,
                        dosage: result1.dosage_id
                    };

                   return brand(j + 1);
                    //console.log(datas);
                });
                //console.log(datas);
            }
            // here value is gadbad
            var value = brand(j);
            console.log(value);
        }
    });
});

// app.get('/gotobrand',function (req,res) {
//     var brand = req.query.brand;
//     console.log(brand);
//     Company.find({company_name : brand}).exec(function (err,result) {
//         if(err){
//             console.log(err);
//         }
//         else {
//             res.send(result);
//         }
//     });
// });

app.get('/findbrand',function (req,res) {
    Brand.find().exec(function (err,result) {
        if(err){
            console.log(err);
        }
        else{
            var data = {};
            data['result'] = [];
            for (var i=0; i<result.length; i++) {
                data['result'][i] = {brand : result[i].brand_name};
            }
            res.render('findbrand', {data: data});
            console.log(data);
        }
    });
});

app.get('/asdas',function (req, res) {


});

//data base connection and opening port
    var db = 'mongodb://localhost/Duplicate';
    mongoose.connect(db, {useMongoClient: true});

//connecting database and starting server
    var database = mongoose.connection;
    database.on('open', function () {
        console.log("database is connected");
        app.listen(app.get('port'), function () {
            console.log('server connected to http:localhost:' + app.get('port'));
        });
    });

app.get('/findcompany',function (req,res) {
    Company.find({}).exec(function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            if (result.length) {
                var data = [];

                for(var i=0;i<result.length;i++)
                {
                    data[i] = {};
                    data[i].company = result[i].company_name;
                    data[i].brands = [];

                    for(var j=0;j<result[i].brand_name.length;j++)
                    {
                        data[i].brands[j] = result[i].brand_name[j].name;
                    }
                }
                console.log(data);
                res.render('findcompany',{data : data});
                console.log(data);
                res.end();
            }
            else {
                console.log("nothing found");
            }
        }
    });
});

// app.get('/findbrand',function (req,res) {
//     Brand.find({}).exec(function (err, result) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             if (result.length) {
//
//                 var data = [];
//                 for(var i = 0;i<result.length;i++) {
//                     data[i] = {};
//                     data[i].brand = result[i].brand_name;
//                     data[i].dosages = [];
//                     for (var j = 0; j < result[i].dosage_form.length; j++) {
//                         data[i].dosages[j] = result[i].dosage_form[j].dosage;
//                     }
//                 }
//                 res.render('findbrand',{data : data});
//                 console.log(data);
//                 res.end();
//             }
//             else {
//                 console.log("nothing can be found");
//             }
//         }
//     });
// });

//
// app.post('/medicine',function (req,res) {
//     var dosage_form = req.body.dosage_form;
//     var brand_name = req.body.brand_name;
//     var company_name = req.body.company_name;
//     var strength = req.body.strength;
//     var active_ingredients = req.body.active_ingredients;
//     var packaging = req.body.packaging;
//     var price = req.body.price;
//
//     Company.findOne({company_name: company_name}, function (err, result) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             if(result){
//                 Brand.findOne({brand_name : brand_name},function (err1,result1) {
//                     if(err1){
//                         console.log(err1);
//                     }
//                     else{
//                         if(result1){
//                             Dosage.findOne({dosage_form : dosage_form},function (err2,result2) {
//                                 if(err2){
//                                     console.log(err2);
//                                 }
//                                 else {
//                                     if(result2){
//                                         Strength.findOne({strength : strength},function (err3,result3) {
//                                             if(err3){
//                                                 console.log(err3);
//                                             }
//                                             else{
//                                                 if(result3){
//                                                     res.send("medicine Already exist");
//                                                 }
//                                                 else{
//                                                     var sTrength = new Strength({
//                                                         strength : strength,
//                                                         active_ingredients : {name : active_ingredients},
//                                                         packaging : packaging,
//                                                         price : price
//                                                     });
//                                                     sTrength.save(function (err4,result4) {
//                                                         if(err4){
//                                                             console.log(err4);
//                                                         }
//                                                         else{
//                                                             Dosage.update({dosage_form : dosage_form},{
//                                                                 $push : {strength_id : result4._id}
//                                                             }).exec(function (err5) {
//                                                                 if(err5){
//                                                                     console.log(err5);
//                                                                 }
//                                                                 else{
//                                                                     res.send("strength added successfully");
//                                                                 }
//                                                             });
//                                                         }
//                                                     });
//                                                 }
//                                             }
//                                         });
//                                     }
//                                     else{
//                                         var stRength = new Strength({
//                                             strength : strength,
//                                             active_ingredients : {name : active_ingredients},
//                                             packaging : packaging,
//                                             price : price
//                                         });
//                                         stRength.save(function (err3,result3) {
//                                             if(err3){
//                                                 console.log(err3);
//                                             }
//                                             else {
//                                                 var dosage = new Dosage({
//                                                     dosage_form: dosage_form,
//                                                     strength_id: result3._id
//                                                 });
//                                                 dosage.save(function (err4, result4) {
//                                                     if(err4){
//                                                         console.log(err4);
//                                                     }
//                                                     else{
//                                                         Brand.update({brand_name : brand_name},{
//                                                             $push : {dosage_id : result4._id}
//                                                         }).exec(function (err5) {
//                                                             if(err5){
//                                                                 console.log(err5);
//                                                             }
//                                                             else{
//                                                                 res.send("Dosage added successfully with strength");
//                                                             }
//                                                         });
//                                                     }
//                                                 });
//                                             }});
//                                     }}});
//                         }
//                         else{
//                             var strEngth = new Strength({
//                                 strength : strength,
//                                 active_ingredients : {name : active_ingredients},
//                                 packaging : packaging,
//                                 price : price
//                             });
//                             strEngth.save(function (err2,result2) {
//                                 if(err2){
//                                     console.log(err2);
//                                 }
//                                 else {
//                                     var dosage = new Dosage({
//                                         dosage_form: dosage_form,
//                                         strength_id: result2._id
//                                     });
//                                     dosage.save(function (err3, result3) {
//                                         if(err3){
//                                             console.log(err3);
//                                         }
//                                         else{
//                                             var brand = new Brand({
//                                                 brand_name : brand_name,
//                                                 dosage_id : result3._id
//                                             });
//                                             brand.save(function (err4,result4) {
//                                                 if(err4){
//                                                     console.log(err4);
//                                                 }
//                                                 else{
//                                                     Company.update({company_name : company_name},{
//                                                         $push :{brand_id : result4._id}
//                                                     }).exec(function (err5) {
//                                                         if (err5) {
//                                                             console.log(err5);
//                                                         }
//                                                         else {
//                                                             res.send("Brand added successfully  with dosage and strength");
//                                                         }
//                                                     });
//                                                 }
//                                             });
//                                         }});
//                                 }});
//                         }}});
//             }
//             else{
//                 Brand.findOne({brand_name : brand_name},function (err1,result1) {
//                     if(err1){
//                         console.log(err1);
//                     }
//                     else{
//                         if(result1){
//                             res.send("other company cannot have same brand");
//                         }
//                         else{
//                             var streNgth = new Strength({
//                                 strength : strength,
//                                 active_ingredients : {name : active_ingredients},
//                                 packaging : packaging,
//                                 price : price
//                             });
//                             streNgth.save(function (err2,result2) {
//                                 if(err2){
//                                     console.log(err2);
//                                 }
//                                 else {
//                                     var dosage = new Dosage({
//                                         dosage_form: dosage_form,
//                                         strength_id: result2._id
//                                     });
//                                     dosage.save(function (err3, result3) {
//                                         if(err1){
//                                             console.log(err1);
//                                         }
//                                         else{
//                                             var brand = new Brand({
//                                                 brand_name : brand_name,
//                                                 dosage_id : result3._id
//                                             });
//                                             brand.save(function (err4,result4) {
//                                                 if(err4){
//                                                     console.log(err4);
//                                                 }
//                                                 else{
//                                                     var company = new Company({
//                                                         company_name : company_name,
//                                                         brand_id : result4._id
//                                                     });
//                                                     company.save(function(err5){
//                                                         if(err5){
//                                                             console.log(err5);
//                                                         }
//                                                         else{
//                                                             res.send("New medicine added");
//                                                         }
//                                                     });
//                                                 }
//                                             });
//                                         }});
//                                 }});
//                         }}});
//             }}});
// });

