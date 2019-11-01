// shellCollection
(function() {
  function swapHtmlElements(a, b) {
    const temp = document.createElement('div');
    a.parentNode.insertBefore(temp, a);
    b.parentNode.insertBefore(a, b);
    temp.parentNode.insertBefore(b, temp);
    temp.parentNode.removeChild(temp);
  }

  const createElement = {
    'title': function() {
      const h1 = document.createElement('h2');
      h1.innerText = this.text;
      return h1;
    },
    'description': function() {
      const p = document.createElement('p');
      p.classList.add('description');
      p.innerText = this.text;
      return p;
    },
    'paragraph': function() {
      const div = document.createElement('div');
      div.classList.add('paragraph');
      div.innerHTML = this.text;
      return div;
    },
    'code': function() {
      const pre = document.createElement('pre');
      pre.classList.add('line-numbers');
      pre.classList.add('language-'+this.lang);
      const codeEl = document.createElement('code');
      codeEl.innerHTML = this.code;
      pre.append(codeEl);
      return pre;
    },
    'image': function() {
      const img = document.createElement('img');
      img.setAttribute('src', this.url);
      return img;
    }
  }

  const typeTranslate = {
    'title': 'заголовок',
    'description': 'описание',
    'paragraph': 'абзац',
    'code': 'код',
    'image': 'изображение'
  }

  function includesAll(...args) {
    return args.every(item => item in this && this[item].trim().length > 0);
  }

  Object.prototype.includesAll = includesAll;

  function canCompute() {
    const { type, vars } = this;

    switch(type) {
      case 'title':
      case 'description':
      case 'paragraph':
        return vars.includesAll('text');
      case 'code':
        return vars.includesAll('lang', 'code');
      case 'image':
        return vars.includesAll('url');
    }
  }

  const cantCompute = document.createElement('div');
  cantCompute.classList.add('cantCompute');
  const cantComputeLabel = document.createElement('span');
  cantComputeLabel.innerText = 'Не удалось сформировать элемент.';
  const cantComputeIcon = document.createElement('i');
  cantComputeIcon.classList.add('material-icons');
  cantComputeIcon.innerText = 'warning';
  cantCompute.appendChild(cantComputeIcon);
  cantCompute.appendChild(cantComputeLabel);

  function computeSelf() {
    this.contentElement.innerHTML = '';
    let el;
    if (!canCompute.call(this)) el = cantCompute.cloneNode(true);
    else el = createElement[this.type].call(this.vars);
    this.contentElement.appendChild(el);
    return el;
  }

  let shellCollection = {
    list: [],
    selector: document.body,
    cntChangeCallback: function() {},
    shellOnClick: function() {},
    render: render,
    parse: parse,
    clear: clear,
    find: find,
    add: add
  };

  function render() {
    return this.list.reduce((result, item) => {
      const el = item.compute();
      if (!el.classList.contains('cantCompute')) result += el.outerHTML;
      else console.warn('Обнаружен несформированный элемент. Рендер коллекции приведет к непоправимой потере данных в незавершенных элементах!');
      return result;
    }, '');
  }

  function clear() {
    this.list.slice(0).forEach(item => item.remove());
    this.cntChangeCallback();
  }

  function find(el) {
    return this.list.find(item => item.parentElement == el);
  }

  function parse(str) {
    if (str.slice(0, 4) == 'old:') {
      str = str.slice(4, str.length);
      str = JSON.parse(str);
      str.forEach(item => console.log(item));
      str = str.join('');
    }

    const doc = new DOMParser().parseFromString(str, 'text/html');
    const elems = [...doc.body.children];

    elems.forEach(item => {
      const tag = item.tagName;
      let type;
      let vars = {};

      switch(tag) {
        case 'H1':
        case 'H2':
          type = 'title';
          vars.text = item.innerText;
          break;
        case 'IMG':
          type = 'image';
          vars.url = item.getAttribute('src');
          break;
        case 'DIV':
        case 'P':
          type = item.className == 'description' ? 'description' : 'paragraph';
          if (type == 'description') vars.text = item.innerText;
          else vars.text = item.innerHTML;
          break;
        case 'PRE':
          type = 'code';
          vars = {
            lang: item.className.match(/language-(\w+)/)[1],
            code: item.firstElementChild.innerHTML
          }
          break;
      }

      const el = this.add(type);
      el.parentElement.onclick = () => this.shellOnClick(el);

      el.vars = vars;
      el.compute();
    });

    this.cntChangeCallback();
  }

  function add(type) {
    const elShell = new elementShell(type);
    this.list.push(elShell);
    this.selector.appendChild(elShell.parentElement);
    elShell.parentElement.onclick = () => this.shellOnClick(elShell);
    this.cntChangeCallback();
    return elShell;
  }

  function elementShell(type) {
    const shell = {};
    const parentElement = document.createElement('div');
    parentElement.classList.add('elementShell');

    const shellHeader = document.createElement('div');
    shellHeader.classList.add('shellHeader');
    const typeLabel = document.createElement('span');
    typeLabel.innerText = typeTranslate[type];
    shellHeader.appendChild(typeLabel);

    const contentElement = document.createElement('div');
    contentElement.classList.add('contentElement');
    parentElement.appendChild(shellHeader);
    parentElement.appendChild(contentElement);

    switch (type) {
      case 'title':
      case 'description':
      case 'paragraph':
        shell.vars = { text: '' };
        break;
      case 'code':
        shell.vars = { lang: '', code: '' };
        break;
      case 'image':
        shell.vars = { url: '' };
        break;
    }

    shell.parentElement = parentElement;
    shell.contentElement = contentElement;
    shell.type = type;
    shell.compute = function() {
      return computeSelf.call(this);
    }

    shell.remove = function() {
      const index = shellCollection.list.indexOf(shell);
      parentElement.remove();
      shellCollection.list.splice(index, 1);
    }

    shell.edit = function() {
      contentElement.innerHTML = '';
      const inputsGroup = document.createElement('div');
      inputsGroup.classList.add('inputsGroup');

      const btns = document.createElement('div');
      btns.classList.add('buttons');

      const save = document.createElement('button');
      save.classList.add('common-btn');
      save.innerText = 'Сохранить';

      const cancel = document.createElement('button');
      cancel.classList.add('common-btn');
      cancel.innerText = 'Отмена';

      const listener = function(event) {
        switch(event.key) {
          case 'Escape':
            cancel.click();
            break;
          case 'Enter':
            const hasPre = ['paragraph', 'code'].includes(shell.type);
            const inputActive = [...inputsGroup.children].includes(document.activeElement);
            if (!hasPre || !inputActive) save.click();
            break;
        }
      }

      cancel.onclick = () => {
        shell.compute();
        contentElement.removeEventListener('keyup', listener);
      }

      btns.appendChild(cancel);
      btns.appendChild(save);
      contentElement.appendChild(inputsGroup);
      contentElement.appendChild(btns);

      contentElement.addEventListener('keyup', listener);

      const varsTranslate = {
        'text': 'Текст',
        'url': 'Ссылка'
      }

      if (!['paragraph', 'code'].includes(type)) {
        let inputs = {};

        Object.keys(shell.vars).forEach(varname => {
          const input = document.createElement('input');
          input.setAttribute('placeholder', varsTranslate[varname]);
          input.value = shell.vars[varname];
          inputsGroup.append(input);
          inputs[varname] = input;
        });

        Object.values(inputs)[0].focus();

        save.onclick = () => {
          Object.keys(shell.vars).forEach(varname => {
            shell.vars[varname] = inputs[varname].value;
          });

          shell.compute();
          contentElement.removeEventListener('keyup', listener);
        }
      }

      else {
        if (type == 'paragraph') {
          const div = document.createElement('div');
          div.innerHTML = shell.vars.text;
          inputsGroup.appendChild(div);
          const buttons = textEditor(div);
          div.focus();

          const group = shell.contentElement.children[1];
          Object.values(buttons).forEach(elem => {
            if (elem.tagName == 'BUTTON') elem.classList.add('common-btn');
            group.insertAdjacentElement('afterBegin', elem);
          });

          save.onclick = () => {
            shell.vars.text = div.innerHTML.replace(/&nbsp;/g, ' ');
            shell.compute();
            contentElement.removeEventListener('keyup', listener);
          }
        }

        else {
          const pre = document.createElement('pre');
          pre.contentEditable = true;
          pre.innerHTML = shell.vars.code;

          const input = document.createElement('input');
          input.setAttribute('placeholder', 'Язык');
          input.value = shell.vars.lang;

          inputsGroup.appendChild(input);
          inputsGroup.appendChild(pre);
          input.focus();

          save.onclick = () => {
            shell.vars = {
              lang: input.value,
              code: pre.innerHTML
            }

            shell.compute();
            contentElement.removeEventListener('keyup', listener);
          }
        }
      }
    }

    shell.up = () => move(true);
    shell.down = () => move(false);

    function move(up) {
      const offset = up ? -1 : 1;
      const index = shellCollection.list.indexOf(shell);
      const siblingIndex = index + offset;
      const sibling = shellCollection.list[siblingIndex];

      if (sibling) {
        const temp = shell;
        shellCollection.list[index] = sibling;
        shellCollection.list[siblingIndex] = temp;
        swapHtmlElements(shell.parentElement, sibling.parentElement);
      }
    }

    shell.compute();
    return shell;
  }

  window.shellCollection = shellCollection;
})();
