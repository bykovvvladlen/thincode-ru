(function() {
  function modal(msg) {
    const background = document.createElement('div');
    background.style.width = '100vw';
    background.style.height = '100vh';
    background.style.overflow = 'hidden';
    background.style.position = 'fixed';
    background.style.top = '0px';
    background.style.left = '0px';
    background.style.background = 'rgba(0,0,0,0.5)';
    background.style.zIndex = 15;
    background.hidden = true;

    const container = document.createElement('div');
    container.style.padding = '16px';
    container.style.background = 'white';
    container.style.borderRadius = '4px';

    const text = document.createElement('div');
    text.style.wordBreak = 'break-word';
    text.style.marginBottom = '16px';
    text.style.maxHeight = '300px';
    text.style.overflowY = 'auto';
    text.innerText = msg;

    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'flex-end';

    const ok = document.createElement('button');
    ok.classList.add('common-btn');
    ok.style.textAlign = 'right';
    ok.innerText = 'Ok';
    ok.onclick = () => this.remove();

    div.appendChild(ok);
    container.appendChild(text);
    container.appendChild(div);
    background.appendChild(container);
    document.body.appendChild(background);
    window.addEventListener('resize', resize);

    function resize() {
      if (window.matchMedia(`(max-width: 464px)`).matches) {
        container.style.margin = '0';
        container.style.marginLeft = '16px';
        container.style.maxWidth = (window.innerWidth - 64) + 'px';
      }

      else {
        container.style.margin = 'auto';
        container.style.maxWidth = '400px';
      }

      const top = (window.innerHeight / 2) - container.getBoundingClientRect().height;
      container.style.marginTop = Math.round(top) + 'px';
    }

    this.show = () => {
      background.hidden = false;
      resize();
    }

    this.remove = () => {
      background.remove();
      window.removeEventListener('resize', resize);
    }
  }

  window.modal = modal;
})();
