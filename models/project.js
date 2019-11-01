const mongoose = require('mongoose');
const settings = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

const project = new mongoose.Schema({
  url: String, // Ссылка
  title: String, // Название проекта
  description: String, // Описание проекта
  repository: String, // Репозиторий
  startDate: Date, // Дата начала
  endDate: Date // Дата окончания
}, settings);

const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
function dateToString(timestamp) { console.log(timestamp);
  const [YYYY, MM, DD] = timestamp.match(/(\d\d\d\d)-(\d\d)-(\d\d)/).slice(1, 4);
  return `${DD} ${months[parseInt(MM) - 1]} ${YYYY} г.`;
}

project.virtual('startDateString').get((value, virtual, doc) => {
  if ('startDate' in doc && doc.startDate && doc.startDate.toString().trim().length > 0) return dateToString(doc.startDate.toISOString());
  else return 'неизвестно';
});

project.virtual('endDateString').get((value, virtual, doc) => {
  if ('endDate' in doc && doc.endDate && doc.endDate.toString().trim().length > 0) return dateToString(doc.endDate.toISOString());
  else return 'неизвестно';
});

module.exports = mongoose.model('project', project);
