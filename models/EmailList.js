var mongoose = require('mongoose'),
    bluebird = require('bluebird');

mongoose.Promise = bluebird;

var Schema = mongoose.Schema;

var EmailListSchema = new Schema(
    {
        email: {type: String},
        date: {type: Date,default: Date.now()}
    }
);

module.exports = mongoose.model('EmailList',EmailListSchema);