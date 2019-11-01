var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var article = require('../models/article.js');
var rate = require('../models/rate.js');
var helper = require('../public/javascripts/helper.js');

mongoose.connect('mongodb://thincore:l3tm3s331@localhost:27017/thincode', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function src(img) {
  return innerText(img, `src="text"`)[0];
}

function innerText(text, mask, saveBorders = false) {
	mask = mask.split('text');
	let begin = mask[0];
	let end = mask[1];
	let pos = text.search(begin);
	let result = [];

	while (pos != -1) {
		text = text.slice(pos + (saveBorders ? 0 : begin.length), text.length);
		pos = text.search(end);
    if (pos == -1) break;

		let inner = text.slice(0, saveBorders ? (pos + end.length) : pos);
		result.push(inner);

		text = text.slice(pos + end.length, text.length);
		pos = text.search(begin);
	}

	return result;
}

function toURL(text) {
  let lits = "a,b,v,g,d,e,zh,z,i,j,k,l,m,n,o,p,r,s,t,u,f,x,c,ch,sh,shh,,y,,e,yu,ya".split(",");
  let lat = text
  .replace(/ё/gi, 'е')
  .replace(/ +/gi, "-")
  .toLowerCase()
  .match(/\w|[а-я]|-/gi)
  .map(e => e.charCodeAt() > 200 ? lits[e.charCodeAt(0) - 1072] : e)
  .join("")
  .replace(/-+/g, '-');

  return lat;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  article.find({ folder: 'public' }, (err, data) => {
    if (err) res.status(500).send({ error: err });
    else {
      res.render('index', {
        title: 'Блог веб-разработчика',
        articles: data.sort((a, b) => a.timestamp < b.timestamp )
      });
    }
  });
});

router.post('/rate', (req, res) => {
  rate.create({
    article_id: req.body.article_id,
    timestamp: new Date().toString(),
    rate: req.body.rate
  }, err => {
    if (err) res.status(500).send({ error: err });
    else res.send('Рейтинг засчитан');
  });
});

module.exports = router;
