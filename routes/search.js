var express = require('express');
var mongoose = require('mongoose');
var article = require('../models/article.js');
var router = express.Router();

function articleFilter(item) {
  let prepare = str => str.toLowerCase().match(/[а-яё]|[a-z]/g).join('').replace(/\s/g, '');
  let searchText = prepare(this);
  let preparedTitle = prepare(item.title);
  let preparedBody = item.markup;
  return preparedTitle.match(searchText) || preparedBody.match(searchText);
}

router.get(``, async (req, res) => {
  let articlesList = await article.find();
  let results = articlesList.filter(articleFilter.bind(req.query.q));
  res.send(results.map(item => {
    return { title: item.title, url: item.url };
  }));
});

module.exports = router;
