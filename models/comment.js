var mongoose = require('mongoose');
var helper = require('../public/javascripts/helper.js');

var comment = new mongoose.Schema({
  article: String,
  author: String,
  timestamp: Date,
  text: String
});

comment.virtual('date').get((value, virtual, doc) => {
  return helper.dateToString(doc.timestamp);
});

module.exports = mongoose.model('comment', comment);
