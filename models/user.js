var mongoose = require('mongoose');

var user = new mongoose.Schema({
  login: String,
  password: String,
  email: String,
  perm: String,
  token: String
});

module.exports = mongoose.model('user', user);
