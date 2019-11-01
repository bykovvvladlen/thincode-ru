const project = require('../models/project.js');
const projectPost = require('../models/projectPost.js');
const helper = require('../public/javascripts/helper.js');

function getByID(req, res) {
  project.findOne(req.params).then(data => res.json(data));
}

function getAll(req, res) {
  project.find().then(data => res.json(data));
}

function create(req, res) {
  const url = helper.toURL(req.body.title);
  req.body.url = url;

  project.create(req.body, error => {
    if (error) res.json({ error });
    else res.json({ status: 'Проект был создан.' });
  });
}

function update(req, res) {
  if ('title' in req.body) {
    const url = helper.toURL(req.body.title);
    req.body.url = url;
  }

  project.updateOne({ _id: req.body._id }, { $set: req.body }, error => {
    if (error) res.json({ error });
    else res.json({ status: 'Проект был изменен.' });
  });
}

function del(req, res) {
  project.deleteOne({ _id: req.body._id }, error => {
    if (error) res.json({ error });
    else res.json({ status: 'Проект был удален.' });
  });
}

function render(req, res) {
  project.find({}, (error, items) => {
    projectPost.find({}, (error, posts) => {
      items.forEach(item => {
        item.posts = posts.filter(post => {
          return post.project_id == item.id;
        });

        item.posts.sort((a, b) => {
          return a.timestamp < b.timestamp;
        });
      });

      res.render('projects', {
        title: 'Мои проекты',
        projects: items
      });
    });
  });
}

function renderPage(req, res) {
  project.findOne(req.params, (error, item) => {
    if (!item) {
      res.render('error', {
        title: 'Страница не найдена',
        error: { status: 404 }
      });
    }

    else {
      projectPost.find({ project_id: item.id }, (error, posts) => {
        posts.sort((a, b) => {
          return a.timestamp < b.timestamp;
        });

        res.render('projectpage', {
          title: item.title,
          project: item,
          posts
        });
      });
    }
  });
}

module.exports = {
  getAll,
  getByID,
  create,
  update,
  delete: del,
  render,
  renderPage
}
