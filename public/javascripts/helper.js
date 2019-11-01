function correctWord(cnt, { one, few, many }) {
  if (cnt == 0) return null;
  if (cnt % 10 == 1 && cnt != 11) return cnt < 20 ? one : cnt+' '+(one == 'минута' ? 'минуту' : one);
  else if (cnt % 10 < 5 && (cnt < 10 || cnt > 20)) return cnt+' '+few;
  else return cnt+' '+many;
}

function dateToString(date) {
  var correct = (cnt, arr) => correctWord(cnt, { one: arr[0], few: arr[1], many: arr[2] });
  let offset = new Date().getTimezoneOffset() * 60000;
  let now = new Date();
  date = new Date(date);
  let diff = new Date(now - date + offset);
  let result;

  let time = {
    years: diff.getFullYear() - 1970,
    months: diff.getMonth(),
    days: diff.getDate() - 1,
    hours: diff.getHours(),
    minutes: diff.getMinutes()
  }

  if (time.years > 0) result = time.years == 1 ? 'год назад' : correct(time.years, ['год', 'года', 'лет']);
  else if (time.months > 0) result = time.months == 1 ? 'месяц назад' : correct(time.months, ['месяц', 'месяца', 'месяцев']);
  else if (time.days > 0) result = time.days == 1 ? 'вчера' : correct(time.days, ['день', 'дня', 'дней']);
  else if (time.hours > 0) result = time.hours == 1 ? 'час назад' : correct(time.hours, ['час', 'часа', 'часов']);
  else if (time.minutes > 0) result = time.minutes == 1 ? 'минуту назад' : result = correct(time.minutes, ['минута', 'минуты', 'минут']);
  else return 'только что';

  return result.match(/\d/gi) ? result+' назад' : result;
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

module.exports = {
  dateToString,
  correctWord,
  innerText,
  toURL
}
