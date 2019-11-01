var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var article = require('../models/article.js');
var comment = require('../models/comment.js');
var user = require('../models/user.js');
var helper = require('../public/javascripts/helper.js');
var DOMParser = require('dom-parser');

async function getRecommendations(target) {
  let articles_list = await article.find();

  return articles_list.filter(element => {
		if (element.id == target.id) return false;
		else return element.keywords.reduce((res, word, index) => {
			if (!res) res = element.keywords.includes(word);
			return res;
		}, false);
	});
}

mongoose.connect('mongodb://thincore:l3tm3s331@localhost:27017/thincode', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Список статей
router.get(`/json`, (req, res) => {
  article.find((err, data) => {
    if (err) res.status(500).send({ error: err });
    else res.json(data);
  });
});

// Страница со статьей
router.get(`/:url`, async (req, res) => {
  let target = await article.findOne({ url: req.params.url });
  let recommendations = await getRecommendations(target);
  let comments = await comment.find({ article: target.id });
  const authed = 'token' in req.cookies && req.cookies.token.trim().length > 0;

  res.render('article', {
    title: target.title,
    article: target,
    recommendations: recommendations,
    comments: comments,
    authed: authed
  });
});

function calcReadtime(text) {
  const time = Math.round(text.length / 1050); console.log('time:'+time);
  return helper.correctWord(time, { one: 'минута', few: 'минуты', many: 'минут' }) || 'менее минуты';
}

function getSettings(text) {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const description = doc.getElementsByClassName('description')[0].textContent;
  const image = doc.getElementsByTagName('img')[0].getAttribute('src');
  return {
    description,
    image
  }
}

// Манипуляции со статьями
// Добавить
router.post(`/`, (req, res) => {
  req.body.timestamp = new Date().toJSON();
  req.body.url = helper.toURL(req.body.title);

  let keysInArgs = Object.keys(req.body);
  let required = ['title', 'keywords', 'category', 'markup'];
  let check = required.map(key => keysInArgs.includes(key)).every(e => e == true);
  req.body.readtime = calcReadtime(req.body.markup);
  Object.assign(req.body, getSettings(req.body.markup));

  if (check) {
    article.create(req.body, (err, article) => {
      if (err) res.status(500).send({ error: err });
      else res.send(`Статья была добавлена.`);
    });
  }

  else res.status(500).send({ error: 'Заполнены не все поля' });
});

// Удалить
router.delete(`/`, (req, res) => {
  article.deleteOne(req.body, err => {
    if (err) res.status(500).send({ error: err });
    else res.send(`Статья была удалена.`);
  });
});

// Обновить
router.post(`/update`, (req, res) => {
  let data = req.body;
  data.values.url = helper.toURL(data.values.title);
  req.body.readtime = calcReadtime(data.values.markup);
  Object.assign(data.values, getSettings(data.values.markup));

  article.updateOne(data.target, data.values, err => {
    if (err) res.status(500).send({ error: err });
    else res.send(`Статья была обновлена.`);
  });
});

// Список комментариев
router.get(`/comment/:article`, (req, res) => {
  comment.find({ article: req.params.article }, (err, data) => {
    if (err) res.status(500).send({ error: err });
    else res.json(data);
  });
});

// Добавить комментарий
router.post(`/comment`, async (req, res) => {
  let item = req.body;
  item.timestamp = new Date();

  if ('token' in req.cookies) {
    const token = req.cookies.token;
    const author = await user.findOne({ token: token });

    if (item.article && author && item.text.trim().length > 15) {
      item.author = author.login;

      comment.create(item, err => {
        if (err) res.status(500).send({ error: err });
        else res.json({ send: true });
      });
    }
    else res.status(500).send({
      error: 'Поля не заполнены, либо длина сообщения слишком маленькая'
    });
  }
  else res.status(500).send({
    error: 'Авторизуйтесь, чтобы продолжить'
  });

});

//Удалить комментарий
router.delete(`/comment`, (req, res) => {
  comment.deleteOne(req.body, err => {
    if (err) res.status(500).send({ error: err });
    else res.send(`Комментарий был удален`);
  });
})

module.exports = router;
