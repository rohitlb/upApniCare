var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Strength = new Schema({
    strength : {type : String},
    active_ingredients : [{name : {type : String}}],
    packaging : {type : String},
    price : {type : String}
});

module.exports = mongoose.model('strength',Strength);