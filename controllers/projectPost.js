const projectPost = require('../models/projectPost.js');

function getByProjectID(req, res) {
  projectPost.find(req.params).then(data => res.json(data));
}

function getAll(req, res) {
  projectPost.find().then(data => res.json(data));
}

function create(req, res) {
  if (!req.body.timestamp) req.body.timestamp = new Date().toString();

  projectPost.create(req.body, error => {
    if (error) res.json({ error });
    else res.json({ status: 'Проектная запись была создана.' });
  });
}

function update(req, res) {
  projectPost.updateOne({ _id: req.body._id }, { $set: req.body }, error => {
    if (error) res.json({ error });
    else res.json({ status: 'Проектная запись была изменена.' });
  });
}

function del(req, res) {
  projectPost.deleteOne({ _id: req.body._id }, error => {
    if (error) res.json({ error });
    else res.json({ status: 'Проектная запись была удалена.' });
  });
}

module.exports = {
  getAll,
  getByProjectID,
  create,
  update,
  delete: del
}
