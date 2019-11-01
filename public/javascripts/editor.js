function textEditor(node) {
  function mark_as(...tag) {
    const content = window.getSelection().toString();
    const html = tag[0] + content + tag[1];
    document.execCommand('insertHTML', false, html);
  }

  const el = node;
  el.contentEditable = true;
  el.onkeydown = function(event) {
    if (event.code == 'Enter') {
      event.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
    }
  }

  const clear = document.createElement('button');
  clear.innerText = 'Очистить';
  clear.onclick = () => mark_as('<span>', '<span>');

  const link = document.createElement('button');
  link.innerText = 'Ссылка';
  link.onclick = () => mark_as('<a href="#">', '</a>');

  const input = document.createElement('input');
  input.setAttribute('placeholder', 'Ссылка');
  input.style.position = 'absolute';
  input.hidden = true;

  el.onclick = ({ target }) => {
    if (target.tagName == 'A') {
      const rect = target.getBoundingClientRect();
      input.hidden = false;
      input.style.top = (rect.top + rect.height + window.scrollY + 4) + 'px';
      input.style.left = rect.left + 'px';
      input.value = target.getAttribute('href');
      input.onkeyup = () => target.setAttribute('href', input.value);
    }
    else input.hidden = true;
  }

  const select = document.createElement('button');
  select.innerText = 'Выделить';
  select.onclick = () => mark_as('<span class="marked">', '</span>');

  return { clear, link, input, select }
}
