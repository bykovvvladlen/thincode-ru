HTMLElement.prototype.hide = function() {
  this.style.display = 'none';
}

HTMLElement.prototype.show = function(display) {
  this.style.display = display || 'block';
}

window.onload = function() {
  function pos(node) {
    return node.getBoundingClientRect();
  }

  let container = document.querySelector('.container');
  let header = document.querySelector('header');
  let init_container_pos = 16;

  function header_placeholder() {
    // container.style.marginTop = init_container_pos + pos(header).height + 'px';
  }

  let footer = document.querySelector('footer');

  function update_footer() {
    let docsize = document.body.clientHeight;
    let winsize = window.innerHeight;

    // если футер приклеен, прибавляем высоту вручную
    let sticky = window.getComputedStyle(footer).position == 'fixed' ? (pos(footer).height + 16) : 0;
    footer.style.position = pos(header).height + docsize + sticky > winsize ? 'relative' : 'fixed';
  }

  let sidebar = document.querySelector('.sidebar');
  let content = document.querySelector('.container > .content');

  function resize_sidebar() {
    sidebar.style.left = (pos(content).width + pos(content).left + 16) + 'px';
    sidebar.style.width = ((window.innerWidth - pos(content).left * 2) - pos(content).width - 32) + 'px';
  }

  function resize_content() {
    update_footer();
    header_placeholder();
    resize_sidebar();
  }

  window.onresize = resize_content;
  resize_content();
  prepareLogotype();
  checkLogin();

  // (function() {
  //   const sidebar = document.querySelector('.sidebar');
  //   let mouseover = false;
  //
  //   sidebar.onmouseover = function() {
  //     if (!mouseover) mouseover = true;
  //   }
  //
  //   sidebar.onmouseleave = function() {
  //     mouseover = false;
  //   }
  //
  //   document.addEventListener('wheel', function(e) {
  //     if (mouseover) {
  //       e.preventDefault();
  //       const newtop = (parseInt(sidebar.style.top.replace('px', '') || 0) + Math.sign(e.deltaY) * 10) + 'px';
  //       sidebar.style.transition = '1s easeout';
  //       sidebar.style.top = newtop;
  //     }
  //   }, { passive: false });
  // })();

  // Поиск по сайту
  (function search() {
    const searchBox = document.querySelector('.search');
    const input = searchBox.querySelector('input');
    const results = document.querySelector('.search-results');
    const wrapper = results.querySelector('.wrapper');
    let hideResultsTimeout;
    let timeout;

    let loaderTemplate = document.createElement('div');
    loaderTemplate.classList.add('lds-ellipsis');
    loaderTemplate.innerHTML = '<div></div><div></div><div></div><div></div>';

    let loader;

    const noOneResultsPlaceholder = wrapper.firstElementChild;

    searchBox.onclick = function() {
      document.addEventListener('click', clickListener);
      results.show();
    }

    function clickListener(event) {
      if (!(event.target == searchBox || event.target.parentNode == searchBox)) {
        results.hide();
        document.removeEventListener('click', clickListener);
      }
    }

    async function setSearchTimeout() {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(doSearch, 750);

      if (!loader) {
        wrapper.innerHTML = '';
        loader = loaderTemplate.cloneNode(true);
        wrapper.appendChild(loader);
      }
    }

    async function doSearch() {
      if (input.value.trim() == '') {
        loader = undefined;
        wrapper.innerHTML = '';
        wrapper.appendChild(noOneResultsPlaceholder);
        return;
      }

      let articlesList = await fetchArticles(input.value);
      if (loader) {
        loader.remove();
        loader = undefined;
      }

      if (articlesList.length > 0) {
        articlesList.forEach(item => {
          let link = document.createElement('a');
          link.innerText = item.title;
          link.setAttribute('href', '/articles/'+item.url);
          wrapper.appendChild(link);
        });
      }

      else wrapper.innerHTML = '<div class="placeholder">Не найдено совпадений по вашему запросу...</div>';
    }

    async function fetchArticles(searchText) {
      const response = await fetch('/search?q='+searchText);
      const json = await response.json();
      return json;
    }

    input.onkeyup = setSearchTimeout;
    results.hide();

  })();
}

function prepareLogotype() {
  const thin = document.querySelector('header .title .thin');
  const code = document.querySelector('header .title .code');
  let logotypeAreToggled = true;

  logotypeToggle();
  setInterval(logotypeAnimate, 20000);

  function logotypeAnimate() {
    logotypeToggle();
    setTimeout(logotypeToggle, 5000);
  }

  function logotypeToggle() {
    Object.assign(thin.style, {
      transform: logotypeAreToggled ? 'scaleX(0.4) translateX(0px)' : 'scaleX(1) translateX(13px)'
    });

    Object.assign(code.style, {
      transform: logotypeAreToggled ? 'scaleX(1) translateX(-8px)' : 'scaleX(0.4) translateX(0px)'
    });

    logotypeAreToggled = !logotypeAreToggled;
  }
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function checkLogin() {
  const username = getCookie('username');
  const token = getCookie('token');

  if (username && token) {
    const group = document.querySelector('footer .btn-group');
    [...group.children].forEach(item => item.style.display = 'none');

    const logout = document.createElement('a');
    logout.setAttribute('href', '#');
    logout.classList.add('control');
    logout.innerText = 'Выйти';
    group.append(logout);

    logout.onclick = function() {
      document.cookie = 'token=; path=/;';
      location.reload();
    }

    const account = document.createElement('a');
    account.setAttribute('title', 'Это вы');
    account.setAttribute('href', '#');
    account.classList.add('control');
    account.innerText = username;
    group.append(account);
  }
}
