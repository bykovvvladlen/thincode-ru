var mongoose = require('mongoose');

var rate = new mongoose.Schema({
  article_id: String,
  timestamp: Date,
  rate: Boolean
});

module.exports = mongoose.model('rate', rate);
