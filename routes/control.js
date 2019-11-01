var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var article = require('../models/article.js');
var user = require('../models/user.js');

mongoose.connect('mongodb://thincore:l3tm3s331@localhost:27017/thincode', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function Token() {
  let symbols = '';
	let t = '';
	for (i = 0; i < 32; i++)
		t += String.fromCharCode(33 + Math.round(Math.random() * 89));
	return t;
}

router.get('/', async (req, res) => {
  let access = false;
  if ('token' in req.cookies) {
    let write = await user.findOne({
      token: req.cookies.token
    });

    if (write) access = write.perm == 'admin';
  }

  res.render('control', {
    title: 'Управление сайтом',
    articles: await article.find(),
    access: access
  })
});

module.exports = router;
