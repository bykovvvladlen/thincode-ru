document.addEventListener('DOMContentLoaded', function() {
  // Авторизация
  let login = document.querySelector('.login button.submit');
  if (login) {
    login.onclick = function() {
      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          login: document.querySelector('.login input.login').value,
          password: document.querySelector('.login input.password').value,
        })
      })
      .then(async response => {
        let data = await response.json();
        if (data.error) alert(data.error);
        else {
          document.cookie = 'token='+data.token+'; path=/;';
          document.cookie = 'username='+data.username+'; path=/;';
          location.replace('/');
        }
      })
      .catch(error => console.error(error));
    }
  }
});
