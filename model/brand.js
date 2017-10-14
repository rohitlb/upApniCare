var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Brand = new Schema({
    brand_name : {type: String},
    dosage_id : [{type : Schema.Types.ObjectId , ref : 'dosage'} ]
});

module.exports = mongoose.model('brand',Brand);