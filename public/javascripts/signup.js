// DANGER
// HERE USED EXPERIMENTAL LIBRARY SIMP
// IT CAN DAMAGE YOUR BRAIN

const settings = body => {return {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
}};

function getValues(form) {
  return [...form].reduce((acc, item) => {
    acc[item.className] = item.value;
    return acc;
  }, {});
}

const view = simp('.container > .content');
const signup_screen = simp.component('.signup', function() {
  const titleGroups = [...this.findAll('.title')];

  this.click('button.done', async done => {
    done.disabled = true;

    const url = '/signup/register';
    const form = this.findAll('.signup input');
    const values = getValues(form);
    const isEmpty = Object.values(values).some(item => item.trim() == '');

    titleGroups.forEach(item => item.style.display = 'none');

    if (isEmpty) {
      [...form].forEach(item => {
        if (item.value.trim().length == 0) {
          const classname = item.className == 'confirm' ? 'pass' : item.className;
          const titleGroup = this.find('.title.'+classname);
          const [icon, title] = [...titleGroup.children];
          titleGroup.style.display = 'flex';
          title.innerText = 'Поле обязательно к заполнению!';
        }
      })
    }

    else if (values.pass != values.confirm) {
      const titleGroup = this.find('.title.pass');
      const [icon, title] = [...titleGroup.children];
      titleGroup.style.display = 'flex';
      title.innerText = 'Пароли не совпадают!';
    }

    else {
      const response = await fetch(url, settings(values));
      const json = await response.json();
      if (json.success) this.open(done_screen);
      else {
        const classname = json.error.match('email') ? 'email' : 'login';
        const titleGroup = this.find('.title.'+classname);
        const [icon, title] = [...titleGroup.children];
        titleGroup.style.display = 'flex';
        title.innerText = json.error;
      }
    }

    done.disabled = false;
  });
});

const done_screen = simp.component('.signup-done', function() {
  this.find('.text').innerText = this.storage().text;
});

view.open(signup_screen);
