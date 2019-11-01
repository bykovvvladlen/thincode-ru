const express = require('express');
const router = express.Router();
const { ProjectValidator, ProjectPostValidator, isValid } = require('../models/validation.js');
const projectController = require('../controllers/project.js');
const projectPostController = require('../controllers/projectPost.js');

router
  .get(`/posts/data.json`, projectPostController.getAll)
  .get(`/posts/:project_id`, ProjectPostValidator.checkID, projectPostController.getByProjectID)
  .post(`/posts/`, ProjectPostValidator.create, isValid, projectPostController.create)
  .put(`/posts`, ProjectPostValidator.update, isValid, projectPostController.update)
  .delete(`/posts/`, ProjectPostValidator.checkID, isValid, projectPostController.delete);

router
  .get('/', projectController.render)
  .get(`/data.json`, projectController.getAll)
  .get(`/:url`, projectController.renderPage)
  .post(`/`, ProjectValidator.create, isValid, projectController.create)
  .put(`/`, ProjectValidator.update, isValid, projectController.update)
  .delete(`/`, ProjectValidator.checkID, isValid, projectController.delete);

module.exports = router;
