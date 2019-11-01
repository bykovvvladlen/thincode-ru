const mongoose = require('mongoose');
const settings = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

const projectPost = new mongoose.Schema({
  project_id: String, // id проекта
  timestamp: Date, // Дата создания
  version: String, // Версия
  body: String // Текст
});

const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
function dateToString(timestamp) {
  const [YYYY, MM, DD] = timestamp.match(/(\d\d\d\d)-(\d\d)-(\d\d)/).slice(1, 4);
  return `${DD} ${months[parseInt(MM) - 1]} ${YYYY} г.`;
}

projectPost.virtual('date').get((value, virtual, doc) => {
  return dateToString(doc.timestamp.toISOString());
});

module.exports = mongoose.model('projectPost', projectPost);
