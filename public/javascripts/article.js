document.addEventListener('DOMContentLoaded', function() {
  findSections();
  bindCommentSubmit();
  prepareRatebox();
});

function createElement(innerHTML) {
  let div = document.createElement('div');
  div.innerHTML = innerHTML;
  return div.children[0];
}

function findSections() {
  let list = document.querySelector('.sections ol.list');
  let header = document.querySelector('header');
  let headers = document.querySelectorAll('.article .markup h2');

  headers.forEach((elem, index) => {
    let node = createElement(`<li><a href="#">${elem.innerText}</a></li>`);
    let link = list.appendChild(node);

    link.onclick = () => {
      window.scrollTo(0, 0);
      window.scrollTo(0, elem.getBoundingClientRect().top - header.getBoundingClientRect().height - 16);
      return false;
    }
  });
}

function bindCommentSubmit() {
  let button = document.querySelector('.comments button.send');
  let text = document.querySelector('.comments .form textarea');
  let article = document.querySelector('.article').attributes['data-id'].value;

  button.onclick = async function() {
    let comment = {
      article: article,
      text: text.value
    }

    let data = JSON.stringify(comment);

    fetch('comment', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    })
    .then(response => response = response.json())
    .then(json => {
      if (json.error) console.error(json.error);
      location.reload();
    });
  }
}

function prepareRatebox() {
  const buttonYes = document.querySelector('.rating button.yes');
  const buttonNo = document.querySelector('.rating button.no');
  const buttonChange = document.querySelector('.rating button.change');
  const thanksText = document.querySelector('.rating .thanks');
  const articleID = document.querySelector('.content .article').getAttribute('data-id');

  function setRate(rate) {
    sendRate(rate);
    buttonYes.hide();
    buttonNo.hide();
    buttonChange.show('inline-block');
    thanksText.show();
  }

  async function sendRate(rate) {
    const url = '/rate';
    const settings = body => {return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }};

  	fetch(url, settings({ rate: rate, article_id: articleID }));
  }

  buttonYes.onclick = () => setRate(true);
  buttonNo.onclick = () => setRate(false);

  buttonChange.onclick = () => {
    buttonYes.show('inline-block');
    buttonNo.show('inline-block');
    buttonChange.hide();
    thanksText.hide();
  }

  buttonChange.hide();
}
