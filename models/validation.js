const { check, validationResult } = require('express-validator');
const project = require('../models/project.js');
const projectPost = require('../models/projectPost.js');

const projectTitleExists = value => {
  return project.find({ title: value }).then(item => {
    if (item.length > 0) {
      return Promise.reject('проект с таким названием уже существует');
    }
  });
}

const projectIDExists = value => {
  return project.find({ _id: value }).then(items => {
    if (items.length == 0) {
      return Promise.reject('проекта с указанным id не существует');
    }
  });
}

const ProjectValidator = {
  checkID: [
    check('_id').not().isEmpty().custom(projectIDExists)
  ],
  create: [
    check('title').not().isEmpty().custom(projectTitleExists),
    check('description').not().isEmpty(),
    check('repository').optional().not().isEmpty(),
    check('startDate').optional().not().isEmpty(),
    check('endDate').optional().not().isEmpty(),
  ],
  update: [
    check('_id').not().isEmpty().custom(projectIDExists),
    check('title').optional().not().isEmpty(),
    check('description').optional().not().isEmpty(),
    check('repository').optional().not().isEmpty(),
    check('startDate').optional().not().isEmpty(),
    check('endDate').optional().not().isEmpty(),
  ]
}

const projectPostIDExists = value => {
  return projectPost.find({ _id: value }).then(items => {
    if (items.length == 0) {
      return Promise.reject('проектного поста с указанным id не существует');
    }
  });
}

const ProjectPostValidator = {
  checkID: [
    check('_id').not().isEmpty().custom(projectPostIDExists)
  ],
  create: [
    check('project_id').not().isEmpty().custom(projectIDExists),
    check('timestamp').optional().not().isEmpty(),
    check('version').not().isEmpty(),
    check('body').not().isEmpty()
  ],
  update: [
    check('_id').not().isEmpty().custom(projectPostIDExists),
    check('project_id').optional().not().isEmpty().custom(projectIDExists),
    check('timestamp').optional().not().isEmpty(),
    check('version').optional().not().isEmpty(),
    check('body').optional().not().isEmpty()
  ]
}

const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).send({errors: errors.array()});
  next();
}

module.exports = {
  ProjectValidator,
  ProjectPostValidator,
  isValid: checkValidationResult
}
