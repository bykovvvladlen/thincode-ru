var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var user = require('../models/user.js');

function genToken(length = 32) {
	let str = '';
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		str += chars[Math.floor(Math.random() * chars.length)];
	}

	return str;
}

router.get('/', (req, res) => {
	const authed = 'token' in req.cookies && req.cookies.token.trim().length > 0;
  res.render('login', { title: 'Авторизация', authed: authed });
});

router.post('/', async (req, res) => {
  let token, error;

  if (req.body.login && req.body.password) {
    let _user = await user.findOne({ login: req.body.login });
    if (_user) {
      if (_user.password == req.body.password) {
        token = genToken();
        user.updateOne({ _id: _user._id }, { token: token }, () => {
          res.json({ token: token, username: _user.login });
        });
      }
      else error = `Неверный пароль.`;
    }
    else error = `Пользователем с таким именем не найден.`;
  }
  else error = `Логин или пароль не были указаны.`;

  if (error) res.status(500).json({ error: error });
});


module.exports = router;
