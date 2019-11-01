var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var user = require('../models/user.js');

router.get('/', (req, res) => {
  res.render('signup', { title: 'Регистрация' });
});

router.post('/register', async (req, res) => {
  if (['login', 'email', 'pass'].map(item => Object.keys(req.body).includes(item)).every(item => item == true)) {
    let similarUser = await user.findOne({ login: req.body.login }) || await user.findOne({ email: req.body.email });
    console.log(similarUser);

    if (!similarUser) {
      let settings = {
        login: req.body.login,
        email: req.body.email,
        password: req.body.pass,
        perm: 'user'
      };

      user.create(settings, err => {
        if (err) res.send({ success: false, error: err });
        else res.send({ success: true });
      });
    }

    else res.send({
      success: false,
      error: 'Такой '+(similarUser.login == req.body.login ? 'логин' : 'email')+' уже кем-то используется.'
    });
  }
});

module.exports = router;
