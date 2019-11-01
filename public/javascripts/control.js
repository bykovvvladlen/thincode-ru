document.addEventListener('DOMContentLoaded', function() {
  function deleteArticle({ _id }) {
    fetch('/articles', {
    	method: 'delete',
    	headers: { 'Content-Type': 'application/json' },
    	body: JSON.stringify({ _id: _id })
    })
    .then(resp => resp.text())
    .then(resp => {
      new modal(resp).show();
      loadArticles.call(this);
    });
  }

  function fetchArticles(callback) {
    fetch('/articles/json')
    .then(response => response.json())
    .then(data => callback(data));
  }

  function saveArticle(data) {
    const update = '_id' in data;
    const url = update ? '/articles/update' : '/articles';
    data.keywords = data.keywords.split(',');
    data = update ? {
      target: { _id: data._id },
      values: data
    } : data;

    fetch(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(resp => resp.text())
    .then(resp => {
      new modal(resp).show();
      this.back();
    });
  }

  function loadArticles() {
    fetchArticles(articles => {
      const viewer = this.find('.viewer');
      const hasArticles = articles && articles.length > 0;

      viewer.querySelectorAll('.common-btn').forEach(el => el.remove());
      viewer.firstElementChild.style.display = hasArticles ? 'none' : 'inline-block';

      if (hasArticles) {
        const warn = () => confirm('Вы уверены? Отменить действие будет невозможно.');

        articles.forEach(item => {
          item.keywords = item.keywords.join();
          const button = document.createElement('button');
          button.style.justifyContent = 'space-between';
          button.classList.add('common-btn');

          const span = document.createElement('span');
          span.innerText = item.title;

          const icon = document.createElement('i');
          icon.classList.add('material-icons');
          icon.title = 'Удалить статью';
          icon.innerText = 'clear';

          button.appendChild(span);
          button.appendChild(icon);
          button.onclick = ({ target }) => {
            if (target == icon) {
              if (warn()) deleteArticle.call(this, item);
            }

            else this.open(detailedArticle, item);
          };

          viewer.appendChild(button);
        });
      }
    });
  }

  const view = simp('.articleEditor', () => {
    if (window.onresize) window.onresize();
  });

  const listOfArticles = simp.component('.listOfArticles', function() {
    loadArticles.call(this);
    this.click('button.addArticle', () => this.open(detailedArticle));
    this.click('button.parse', () => this.open(detailedArticle, { stringToParse: prompt('Вставьте строку в поле ниже.') }));
  });

  // Редактирование статьи
  const detailedArticle = simp.component('.detailedArticle', function() {
    const panel = this.find('.panel');
    // Очищаем коллекцию
    shellCollection.clear();
    const noOneElement = this.find('.noOneElement');
    const checkElemsCount = () => {
      const isEmpty = shellCollection.list.length == 0;
      noOneElement.style.display = isEmpty ? 'block' : 'none';
      if (window.onscroll) window.onscroll();
      if (window.onresize) window.onresize();
    }

    // Устанавливаем колбэк, вызываемый при смене кол-ва элементов в коллекции
    shellCollection.cntChangeCallback = checkElemsCount;
    // и селектор, к которому будут добавлены элементы
    shellCollection.selector = this.find('.viewer');

    const select = this.find('select.element');
    const viewer = this.find('.viewer');
    const controls = this.find('.controls');
    const mode = this.find('.mode');
    let currentMode = 'none';

    // Обработчик клика на оболочку
    const shellOnClick = el => {
      // В зависимости от режима подсвечиваем, либо изменяем элемент
      switch(currentMode) {
        case 'none':
          break;
        case 'move':
          viewer.querySelectorAll('.elementShell').forEach(item =>
            item.classList.remove('selected')
          );

          el.parentElement.classList.add('selected');
          break;
        case 'delete':
          el.parentElement.classList.toggle('selected');
          break;
        case 'edit':
          panel.querySelector('button.cancelMode').click();
          el.edit();
          break;
      }
    }

    // Добавляем обработчик клика на оболочку
    shellCollection.shellOnClick = shellOnClick;

    // Если в хранилище присутствует разметка, парсим
    if ('markup' in this.storage()) {
      shellCollection.parse(this.storage().markup);
    }

    // Если строка с разметкой передана явно
    else if ('stringToParse' in this.storage()) {
      shellCollection.parse(this.storage().stringToParse);
    }

    // Горячие клавиши
    const listener = function(event) {
      if (event.shiftKey && currentMode == 'none') {
        const keyType = {
          'Digit1': 'title',
          'Digit2': 'description',
          'Digit3': 'paragraph',
          'Digit4': 'code',
          'Digit5': 'image'
        }

        if (event.code in keyType) {
          const el = shellCollection.add(keyType[event.code]);
          el.edit();
        }
      }
    }

    // Вешаем обработчик
    window.addEventListener('keyup', listener);

    // Отрендерить коллекцию
    this.click('i.render', () => {
      new modal(shellCollection.render()).show();
    });

    // Отменить редактирование
    this.click('button.cancel', () => {
      window.removeEventListener('keyup', listener);
      panel.remove();
      window.onscroll = null;
      this.back();
    });

    // Добавить элемент
    this.click('button.addElement', () => {
      const type = select.value;
      const shell = shellCollection.add(type);
    });

    // Сохранить статью
    this.click('button.save', () => {
      this.storage().markup = shellCollection.render().replace(/(<code>)+/g, '<code>').replace(/(<\/code>)+/g, '</code>');
      window.removeEventListener('keyup', listener);
      panel.remove();
      window.onscroll = null;
      saveArticle.call(this, this.storage());
    });

    // Переместить элемент
    this.click('button.moveElement', () => {
      const el = () => viewer.querySelector('.elementShell.selected');
      const selected = () => shellCollection.find(el());
      const up = document.createElement('button');
      up.classList.add('common-btn');
      up.innerText = 'Наверх';
      up.onclick = () => selected().up();

      const down = document.createElement('button');
      down.classList.add('common-btn');
      down.innerText = 'Вниз';
      down.onclick = () => selected().down();

      mode.appendChild(up);
      mode.appendChild(down);

      currentMode = 'move';
      controls.style.display = 'none';
      mode.style.display = 'flex';
    });

    // Привязываем select к хранилищу
    const selectFolder = this.find('select.folder');
    selectFolder.onchange = () => this.storage().folder = selectFolder.value;

    // Режим удаления
    this.click('button.deleteElement', () => {
      const warn = () => confirm('Вы уверены? Восстановить элементы будет невозможно.');
      currentMode = 'delete';

      // Кнопка "Удалить выделенное"
      const deleteSelected = document.createElement('button');
      deleteSelected.innerText = 'Удалить выделенное';
      deleteSelected.classList.add('common-btn');
      deleteSelected.onclick = () => {
        if (warn()) {
          const elems = viewer.querySelectorAll('.elementShell.selected');
          const items = [...elems].map(item => {
            return shellCollection.find(item);
          });

          items.forEach(item => item.remove());
        }
      }

      // Кнопка "Удалить все"
      const deleteAll = document.createElement('button');
      deleteAll.innerText = 'Удалить все';
      deleteAll.classList.add('common-btn');
      deleteAll.onclick = () => {
        if (warn()) {
          shellCollection.clear();
        }
      }

      // Добавляем кнопки и показываем их
      mode.appendChild(deleteSelected);
      mode.appendChild(deleteAll);
      mode.style.display = 'flex';
      controls.style.display = 'none';
    });

    // Режим редактирования
    this.click('button.editElement', () => {
      currentMode = 'edit';
      mode.style.display = 'flex';
      controls.style.display = 'none';
    });

    // Выход из режима
    this.click('button.cancelMode', () => {
      // Сбрасываем режим
      currentMode = 'none';

      // Убираем выделение со всех элементов
      viewer.querySelectorAll('.elementShell').forEach(item =>
        item.classList.remove('selected')
      );

      // Удаляем лишние кнопки режима
      [...mode.querySelectorAll('button')]
        .filter(item => !item.classList.contains('cancelMode'))
        .forEach(btn => btn.remove());

      // Скрываем кнопки режима
      controls.style.display = 'flex';
      mode.style.display = 'none';
    });

    // Липкая панель
    let stuck = false;
    const footer = document.querySelector('footer');
    const panelHeight = panel.getBoundingClientRect().height;
    const footerHeight = footer.getBoundingClientRect().height + 16 + 16;
    const wholeHeight = () => document.body.offsetHeight - document.documentElement.clientHeight;
    const leftOffset = () => document.querySelector('.articleEditor').getBoundingClientRect().left + 'px';
    window.onscroll = () => {
      if (!stuck) {
        if (window.scrollY > wholeHeight() - footerHeight) {
          panel.style.left = null;
          panel.style.position = 'relative';
          panel.style.top = '16px';
          footer.insertAdjacentElement('beforeBegin', panel);
          stuck = true;
        }
      }

      else {
        if (window.scrollY < wholeHeight() - (panelHeight + footerHeight)) {
          panel.style.left = leftOffset();
          panel.style.position = 'fixed';
          panel.style.top = null;
          stuck = false;
        }
      }
    }

    window.onscroll();
  });

  // Открываем список статей
  view.open(listOfArticles);
  window.view = view;
});
