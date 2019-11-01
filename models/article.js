const mongoose = require('mongoose');
const helper = require('../public/javascripts/helper.js');

const settings = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

const article = new mongoose.Schema({
  title: String,
  markup: String,
  keywords: Array,
  category: String,
  image: String,
  description: String,
  timestamp: Date,
  folder: String,
  url: String,
  readtime: String
}, settings);

article.virtual('date').get((value, virtual, doc) => {
  return helper.dateToString(doc.timestamp);
});

module.exports = mongoose.model('article', article);
